import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret = request.headers.get('x-chilimba-webhook-secret');
    if (process.env.PAYMENT_WEBHOOK_SECRET && secret !== process.env.PAYMENT_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const transactionId = String(body.transaction_id || '');
    const status = String(body.status || '').toLowerCase();
    if (!transactionId || !['success','failed','pending'].includes(status)) return NextResponse.json({ error: 'Invalid callback.' }, { status: 400 });
    const supabase = await createClient();
    const { data: tx } = await supabase.from('payment_transactions').select('id,status,metadata').eq('provider_transaction_id', transactionId).single();
    if (!tx) return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });
    if (tx.status === 'successful' || tx.status === 'failed') return NextResponse.json({ ok: true, status: tx.status });
    const mapped = status === 'success' ? 'successful' : status === 'failed' ? 'failed' : 'pending';
    await supabase.from('payment_transactions').update({ status: mapped, metadata: { ...(tx.metadata || {}), moneyunify_callback: body, callback_received_at: new Date().toISOString() } }).eq('id', tx.id);
    const contributionId = (tx.metadata as any)?.contribution_id;
    if (contributionId && mapped === 'successful') await supabase.from('contributions').update({ status: 'paid', paid_at: new Date().toISOString(), payment_transaction_id: tx.id }).eq('id', contributionId).eq('status','pending');
    if (contributionId && mapped === 'failed') await supabase.from('contributions').update({ status: 'pending', paid_at: null }).eq('id', contributionId);
    return NextResponse.json({ ok: true, status: mapped });
  } catch { return NextResponse.json({ error: 'Invalid callback request.' }, { status: 400 }); }
}
