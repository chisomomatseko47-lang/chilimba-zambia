export type PaymentProvider = 'mtn' | 'airtel' | 'zamtel' | 'sandbox';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'reversed';

export type PaymentRequest = {
  contributionId: string;
  groupId: string;
  userId: string;
  amount: number;
  currency: 'ZMW';
  phone: string;
  provider: PaymentProvider;
};

export interface PaymentAdapter {
  initiate(request: PaymentRequest): Promise<{ reference: string; status: PaymentStatus }>;
}

export function normalizeZambianPhone(phone: string) {
  const value = phone.replace(/[\s()-]/g, '');
  if (/^0\d{9}$/.test(value)) return `+260${value.slice(1)}`;
  if (/^260\d{9}$/.test(value)) return `+${value}`;
  if (/^\+260\d{9}$/.test(value)) return value;
  throw new Error('Enter a valid Zambian mobile number.');
}

export class SandboxPaymentAdapter implements PaymentAdapter {
  async initiate(request: PaymentRequest) {
    return { reference: `sandbox-${request.contributionId}-${Date.now()}`, status: 'successful' as const };
  }
}

export function getPaymentAdapter(provider: PaymentProvider): PaymentAdapter {
  if (provider === 'sandbox') return new SandboxPaymentAdapter();
  throw new Error(`${provider.toUpperCase()} mobile-money integration is not configured yet.`);
}
