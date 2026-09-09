import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { contribution_id } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: contribution } = await supabase.from('contributions').select('id,group_id,member_id,amount,status,group_members!inner(user_id)').eq('id', contribution_id).eq('group_id', id).single();
  if (!contribution || (contribution as any).group_members.user_id !== user.id) return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
  if (contribution.status === 'paid') return NextResponse.json({ ok: true, alreadyPaid: true });

  const key = `sim-${contribution.id}`;
  const { data: tx, error: txError } = await supabase.from('payment_transactions').insert({ user_id: user.id, group_id: id, direction: 'inbound', status: 'successful', provider: 'sandbox', provider_transaction_id: key, idempotency_key: key, amount: contribution.amount, currency: 'ZMW', metadata: { mode: 'simulation' } }).select('id').single();
  if (txError) return NextResponse.json({ error: txError.message }, { status: 400 });

  const { error } = await supabase.from('contributions').update({ status: 'paid', paid_at: new Date().toISOString(), payment_transaction_id: tx.id }).eq('id', contribution.id).eq('status', 'pending');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, transaction_id: tx.id, mode: 'simulation' });
}
