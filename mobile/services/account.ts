import { wait } from '../mocks/flags';
import type { Account, PaymentMethod } from '../types';

// The mock keeps account data in app state; these stand in for the requests the back end will need.

// TODO(backend): store the default payment method on the resident.
export async function setPayment(method: PaymentMethod): Promise<PaymentMethod> {
  await wait(200);
  return method;
}

// TODO(backend): vouchers endpoint (apply or remove MANONG50).
export async function setVoucher(on: boolean): Promise<boolean> {
  await wait(200);
  return on;
}

// TODO(backend): notification preferences; push tokens once push is set up.
export async function setAlerts(alerts: Account['alerts']): Promise<Account['alerts']> {
  await wait(200);
  return alerts;
}
