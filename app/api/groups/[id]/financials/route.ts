import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: membership } = await supabase.from('group_members').select('role').eq('group_id', id).eq('user_id', user.id).eq('status', 'active').single();
  if (!membership || membership.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const { data: group, error: ge } = await supabase.from('chilimba_groups').select('id,name,contribution_amount,frequency').eq('id', id).single();
  if (ge || !group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  const { data: members } = await supabase.from('group_members').select('id,payout_position,profiles(full_name,phone)').eq('group_id', id).eq('status','active').order('payout_position');
  const { data: contributions } = await supabase.from('contributions').select('id,member_id,due_date,amount,status,paid_at').eq('group_id', id).order('due_date');
  const { data: payouts } = await supabase.from('payouts').select('id,recipient_member_id,payout_position,scheduled_date,amount,status').eq('group_id', id).order('payout_position');
  const all = contributions || []; const collected = all.filter(x=>x.status==='paid').reduce((s,x)=>s+Number(x.amount),0); const outstanding = all.filter(x=>x.status==='pending').reduce((s,x)=>s+Number(x.amount),0); const currentPayout = (payouts||[]).find(x=>x.status==='scheduled'); const currentDue = currentPayout ? all.filter(x=>x.due_date===currentPayout.scheduled_date) : []; const ready = !!currentPayout && currentDue.length>0 && currentDue.every(x=>x.status==='paid');
  return NextResponse.json({ group, members: members||[], contributions: all, payouts: payouts||[], summary: { collected, outstanding, totalExpected: collected+outstanding, collectionRate: collected+outstanding ? Math.round(collected/(collected+outstanding)*100) : 0, currentPayout, currentCyclePaid: currentDue.filter(x=>x.status==='paid').length, currentCycleTotal: currentDue.length, payoutReady: ready } });
}
