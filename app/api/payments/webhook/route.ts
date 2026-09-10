import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  try {
    const body = await request.json();
    const secret = request.headers.get('x-chilimba-webhook-secret');
    if (!process.env.PAYMENT_WEBHOOK_SECRET || secret !== process.env.PAYMENT_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const reference = String(body.reference || body.provider_transaction_id || '');
    const status = String(body.status || '').toLowerCase();
    if (!reference || !['successful','failed','reversed','pending'].includes(status)) return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
    const { data: tx } = await supabase.from('payment_transactions').select('id,group_id,user_id,status,metadata').eq('provider_transaction_id', reference).single();
    if (!tx) return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });
    await supabase.from('payment_transactions').update({ status, metadata: { ...(tx.metadata || {}), webhook_received_at: new Date().toISOString() } }).eq('id', tx.id);
    const contributionId = (tx.metadata as any)?.contribution_id;
    if (contributionId) {
      const contributionStatus = status === 'successful' ? 'paid' : status === 'reversed' || status === 'failed' ? 'pending' : 'pending';
      await supabase.from('contributions').update({ status: contributionStatus, ...(status === 'successful' ? { paid_at: new Date().toISOString() } : { paid_at: null }) }).eq('id', contributionId);
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Invalid webhook request.' }, { status: 400 }); }
}
