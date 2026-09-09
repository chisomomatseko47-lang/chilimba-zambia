import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function addPeriod(date: Date, frequency: string) {
  const d = new Date(date);
  if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else if (frequency === 'biweekly') d.setDate(d.getDate() + 14);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: group } = await supabase.from('chilimba_groups').select('*').eq('id', id).single();
  if (!group || group.created_by !== user.id) return NextResponse.json({ error: 'Group admin access required' }, { status: 403 });

  const { data: members, error: membersError } = await supabase.from('group_members').select('id,payout_position').eq('group_id', id).eq('status', 'active').order('payout_position');
  if (membersError) return NextResponse.json({ error: membersError.message }, { status: 400 });
  if (!members?.length) return NextResponse.json({ error: 'Add at least one active member first.' }, { status: 400 });

  const pool = Number(group.contribution_amount) * members.length;
  const contributionRows = [];
  const payoutRows = [];
  let due = new Date(group.start_date + 'T00:00:00Z');

  for (let cycle = 0; cycle < members.length; cycle++) {
    for (const member of members) {
      contributionRows.push({ group_id: id, member_id: member.id, due_date: due.toISOString().slice(0, 10), amount: group.contribution_amount, status: 'pending' });
    }
    const recipient = members.find(m => m.payout_position === cycle + 1) || members[cycle];
    payoutRows.push({ group_id: id, recipient_member_id: recipient.id, payout_position: cycle + 1, scheduled_date: due.toISOString().slice(0, 10), amount: pool, status: 'scheduled' });
    due = new Date(addPeriod(due, group.frequency) + 'T00:00:00Z');
  }

  const { error: cError } = await supabase.from('contributions').upsert(contributionRows, { onConflict: 'member_id,due_date', ignoreDuplicates: true });
  if (cError) return NextResponse.json({ error: cError.message }, { status: 400 });
  const { error: pError } = await supabase.from('payouts').upsert(payoutRows, { onConflict: 'group_id,payout_position', ignoreDuplicates: true });
  if (pError) return NextResponse.json({ error: pError.message }, { status: 400 });

  return NextResponse.json({ ok: true, members: members.length, cyclePayout: pool, cycles: members.length });
}
