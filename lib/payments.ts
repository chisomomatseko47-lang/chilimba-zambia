import MoneyUnify from 'money-unify-js';

export type PaymentProvider = 'moneyunify' | 'sandbox';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'reversed';
export type PaymentRequest = { contributionId:string; groupId:string; userId:string; amount:number; currency:'ZMW'; phone:string; provider:PaymentProvider };
export type PayoutRequest = { payoutId:string; groupId:string; userId:string; amount:number; phone:string; firstName:string; lastName:string; email:string };
export interface PaymentAdapter { initiate(request:PaymentRequest):Promise<{reference:string;status:PaymentStatus}>; verify?(reference:string):Promise<{status:PaymentStatus;reference:string}>; disburse?(request:PayoutRequest):Promise<{reference:string;status:PaymentStatus}>; }

export function normalizeZambianPhone(phone:string){const value=phone.replace(/[\s()-]/g,'');if(/^0\d{9}$/.test(value))return `+260${value.slice(1)}`;if(/^260\d{9}$/.test(value))return `+${value}`;if(/^\+260\d{9}$/.test(value))return value;throw new Error('Enter a valid Zambian mobile number.');}
function extractReference(response:any){return String(response?.data?.reference||response?.data?.transaction_id||response?.reference||response?.transaction_id||'');}
function extractStatus(response:any):PaymentStatus{const status=String(response?.data?.status||response?.status||'').toLowerCase();if(status==='successful'||status==='success')return 'successful';if(status==='failed'||status==='declined')return 'failed';if(status==='reversed')return 'reversed';return 'pending';}

export class SandboxPaymentAdapter implements PaymentAdapter {async initiate(request:PaymentRequest){return{reference:`sandbox-${request.contributionId}-${Date.now()}`,status:'successful' as const}} async disburse(request:PayoutRequest){return{reference:`sandbox-payout-${request.payoutId}-${Date.now()}`,status:'successful' as const}}}

export class MoneyUnifyPaymentAdapter implements PaymentAdapter {
 private readonly muid=process.env.MONEYUNIFY_MUID;
 private requireMuid(){if(!this.muid)throw new Error('MoneyUnify is not configured. Add MONEYUNIFY_MUID to the server environment.');return this.muid;}
 async initiate(request:PaymentRequest){const muid=this.requireMuid();const phone=normalizeZambianPhone(request.phone).replace('+','');const response=await MoneyUnify.requestPayment(muid,phone,request.amount);const reference=extractReference(response);if(!reference)throw new Error('MoneyUnify did not return a transaction reference.');return{reference,status:extractStatus(response)}}
 async verify(reference:string){const muid=this.requireMuid();const response=await MoneyUnify.verifyTransaction(muid,reference);return{reference,status:extractStatus(response)}}
 async disburse(request:PayoutRequest){const muid=this.requireMuid();const phone=normalizeZambianPhone(request.phone).replace('+','');const response=await MoneyUnify.sendMoney(muid,request.email,request.firstName,request.lastName,phone,`Chilimba payout ${request.payoutId}: ZMW ${request.amount}`);const reference=extractReference(response);if(!reference)throw new Error('MoneyUnify did not return a payout reference.');return{reference,status:extractStatus(response)}}
}

export function getPaymentAdapter(provider:PaymentProvider):PaymentAdapter{if(provider==='sandbox')return new SandboxPaymentAdapter();if(provider==='moneyunify')return new MoneyUnifyPaymentAdapter();throw new Error('Unsupported payment provider.');}
