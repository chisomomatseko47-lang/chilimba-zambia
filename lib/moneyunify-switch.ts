export type SwitchStatus = 'success' | 'failed' | 'pending' | 'error';

const baseUrl = process.env.MONEYUNIFY_BASE_URL || 'https://your-moneyunify-switch.example.com';

function token() { const value = process.env.MONEYUNIFY_API_TOKEN; if (!value) throw new Error('MONEYUNIFY_API_TOKEN is not configured.'); return value; }

async function call(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, { method:'POST', headers:{ Authorization:`Bearer ${token()}`, 'Content-Type':'application/json', Accept:'application/json' }, body:JSON.stringify(body), cache:'no-store' });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(data?.message || `MoneyUnify request failed (${response.status}).`);
  return data;
}

export async function requestPayment(input:{amount:number;accountNumber:string;callbackUrl?:string}) { return call('/api/v1/payment/request',{ amount:input.amount, account_number:input.accountNumber, country:'ZM', ...(input.callbackUrl ? {callback_url:input.callbackUrl} : {}) }); }
export async function verifyPayment(transactionId:string) { return call('/api/v1/payment/verify',{transaction_id:transactionId}); }
