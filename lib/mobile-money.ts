import { PaymentAdapter, PaymentRequest, PaymentStatus } from './payments';

export type MobileMoneyProvider = 'mtn' | 'airtel' | 'zamtel';

export interface MobileMoneyConfig { provider: MobileMoneyProvider; baseUrl: string; apiKey?: string; apiSecret?: string; subscriptionKey?: string; environment?: 'sandbox' | 'production'; }

export interface MobileMoneyResult { reference: string; status: PaymentStatus; provider: MobileMoneyProvider; raw?: unknown; }

export class ConfiguredMobileMoneyAdapter implements PaymentAdapter {
  constructor(private readonly config: MobileMoneyConfig) {}
  async initiate(request: PaymentRequest): Promise<MobileMoneyResult> {
    if (!this.config.baseUrl || !this.config.apiKey) throw new Error(`${this.config.provider.toUpperCase()} is not configured. Add provider credentials before enabling live payments.`);
    throw new Error(`${this.config.provider.toUpperCase()} adapter requires its provider-specific API implementation.`);
  }
}

export function getConfiguredProvider(provider: MobileMoneyProvider): ConfiguredMobileMoneyAdapter {
  const prefix = provider.toUpperCase();
  return new ConfiguredMobileMoneyAdapter({
    provider,
    baseUrl: process.env[`${prefix}_MOMO_BASE_URL`] || '',
    apiKey: process.env[`${prefix}_MOMO_API_KEY`],
    apiSecret: process.env[`${prefix}_MOMO_API_SECRET`],
    subscriptionKey: process.env[`${prefix}_MOMO_SUBSCRIPTION_KEY`],
    environment: (process.env[`${prefix}_MOMO_ENVIRONMENT`] as 'sandbox'|'production') || 'sandbox',
  });
}
