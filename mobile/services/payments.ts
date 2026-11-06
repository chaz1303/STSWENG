import { wait } from '../mocks/flags';
import type { PaymentMethod } from '../types';

// TODO(backend): GCash through a payment gateway. Flow 4 holds the job price in escrow when the booking is
// made and releases it when the job is done; the tip is charged on top. Whether payment is in scope at all
// is ICM open item 7.
export async function chargeTip(amount: number, method: PaymentMethod) {
  if (amount < 0 || amount > 5000) throw new Error('Enter a tip between ₱0 and ₱5,000');
  if (method === 'gcash' && amount > 0) await wait(500);
}
