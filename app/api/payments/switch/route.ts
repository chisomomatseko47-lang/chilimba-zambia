import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeZambianPhone } from '@/lib/payments';
import { requestPayment } from '@/lib/moneyunify-switch';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data:{user} } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  try {
    const body=await req.json();
    const {data:c}=await supabase.from('contributions').select('id,group_id,member_id,amount,status').eq('id',body.contribution_id).single();
    if(!c || c.status!=='pending') return NextResponse.json({error:'Contribution is not payable.'},{status:400});
    const {data:m}=await supabase.from('group_members').select('user_id').eq('id',c.member_id).eq('group_id',c.group_id).single();
    if(!m || m.user_id!==user.id) return NextResponse.json({error:'You cannot pay this contribution.'},{status:403});
    const phone=normalizeZambianPhone(String(body.phone||user.phone||''));
    const callbackUrl=`${process.env.NEXT_PUBLIC_APP_URL}/api/payments/moneyunify/callback`;
    const result=await requestPayment({amount:Number(c.amount),accountNumber:phone,callbackUrl});
    if(result?.status!=='success') return NextResponse.json({error:result?.message||'Payment request failed.',status:result?.status||'error'},{status:400});
    const tx=result.data||{};
    const {data:record,error}=await supabase.from('payment_transactions').insert({user_id:user.id,group_id:c.group_id,direction:'inbound',status:tx.status||'pending',provider:'moneyunify',provider_transaction_id:tx.transaction_id, idempotency_key:tx.transaction_id,amount:c.amount,currency:'ZMW',metadata:{contribution_id:c.id,reference:tx.reference,provider:'moneyunify'}}).select('id').single();
    if(error) throw error;
    return NextResponse.json({ok:true,transaction_id:tx.transaction_id,reference:tx.reference,status:tx.status||'pending',payment_transaction_id:record.id});
  } catch(e:any){return NextResponse.json({error:e.message||'Unable to initiate payment.'},{status:400});}
}
