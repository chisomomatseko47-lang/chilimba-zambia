export type PaymentStatus = 'pending'|'processing'|'successful'|'failed';
export type PaymentRequest = { reference:string; amount:number; currency:'ZMW'; phone:string; purpose:'contribution'|'payout' };
export interface PaymentProvider { initiate(req:PaymentRequest):Promise<{providerReference:string;status:PaymentStatus}>; verify(providerReference:string):Promise<PaymentStatus>; }
