import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const valid = new Set(['pending','successful','failed','reversed']);
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-chilimba-webhook-secret');
  if (!process.env.PAYMENT_WEBHOOK_SECRET || secret !== process.env.PAYMENT_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const reference = String(body.reference || body.provider_transaction_id || '');
    const status = String(body.status || '').toLowerCase();
    if (!reference || !valid.has(status)) return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
    const supabase = await createClient();
    const { data: tx } = await supabase.from('payment_transactions').select('id,status,metadata').eq('provider_transaction_id', reference).eq('direction','outbound').single();
    if (!tx) return NextResponse.json({ error: 'Payout transaction not found.' }, { status: 404 });
    const payoutId = (tx.metadata as any)?.payout_id;
    if (!payoutId) return NextResponse.json({ error: 'Payout reference missing.' }, { status: 400 });
    const payoutStatus = status === 'successful' ? 'paid' : status === 'failed' ? 'failed' : status === 'reversed' ? 'reversed' : 'processing';
    await supabase.from('payment_transactions').update({ status, metadata: { ...(tx.metadata || {}), webhook_received_at: new Date().toISOString() } }).eq('id', tx.id);
    const update: Record<string, unknown> = { status: payoutStatus };
    if (status === 'successful') update.paid_at = new Date().toISOString();
    const { error } = await supabase.from('payouts').update(update).eq('id', payoutId).in('status',['processing','scheduled']);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, payout_id: payoutId, status: payoutStatus });
  } catch { return NextResponse.json({ error: 'Invalid webhook request.' }, { status: 400 }); }
}
