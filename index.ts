import type { PaymentProvider } from './provider';

// Inject a licensed PSP adapter here. Never expose provider credentials to the browser.
export function getPaymentProvider(): PaymentProvider {
  throw new Error('PAYMENT_PROVIDER adapter not configured');
}
