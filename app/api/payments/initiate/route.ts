import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentAdapter, normalizeZambianPhone, type PaymentProvider } from '@/lib/payments';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const provider = (body.provider || process.env.PAYMENT_PROVIDER || 'sandbox') as PaymentProvider;
    if (provider !== 'sandbox' && provider !== 'moneyunify') return NextResponse.json({ error: 'Unsupported payment provider.' }, { status: 400 });
    const phone = normalizeZambianPhone(String(body.phone || user.phone || ''));
    const { data: contribution } = await supabase.from('contributions').select('id,group_id,member_id,amount,status').eq('id', body.contribution_id).single();
    if (!contribution || contribution.status !== 'pending') return NextResponse.json({ error: 'Contribution is not payable.' }, { status: 400 });
    const { data: membership } = await supabase.from('group_members').select('user_id').eq('id', contribution.member_id).eq('group_id', contribution.group_id).single();
    if (!membership || membership.user_id !== user.id) return NextResponse.json({ error: 'You cannot pay this contribution.' }, { status: 403 });
    const adapter = getPaymentAdapter(provider);
    const result = await adapter.initiate({ contributionId: contribution.id, groupId: contribution.group_id, userId: user.id, amount: Number(contribution.amount), currency: 'ZMW', phone, provider });
    const { data: tx, error } = await supabase.from('payment_transactions').insert({ user_id: user.id, group_id: contribution.group_id, direction: 'inbound', status: result.status, provider, provider_transaction_id: result.reference, idempotency_key: result.reference, amount: contribution.amount, currency: 'ZMW', metadata: { contribution_id: contribution.id, phone } }).select('id').single();
    if (error) throw error;
    if (result.status === 'successful') await supabase.from('contributions').update({ status: 'paid', paid_at: new Date().toISOString(), payment_transaction_id: tx.id }).eq('id', contribution.id).eq('status', 'pending');
    return NextResponse.json({ ok: true, transaction_id: tx.id, reference: result.reference, status: result.status, provider });
  } catch (e: any) { return NextResponse.json({ error: e.message || 'Unable to initiate payment.' }, { status: 400 }); }
}
