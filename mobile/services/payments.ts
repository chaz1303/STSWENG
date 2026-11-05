import { mockFlags, wait } from '../mocks/flags';
import type { Booking, PaymentMethod } from '../types';

// TODO(backend): GCash through a payment gateway, confirmed by webhook; cash is recorded by the Manong.
// Whether payment is in scope at all is ICM open item 7.
export async function pay(booking: Booking, method: PaymentMethod): Promise<Booking> {
  if (method === 'gcash') {
    await wait(1300);
    if (mockFlags.failNextPayment) {
      mockFlags.failNextPayment = false;
      throw new Error('GCash declined it, so nothing was charged.');
    }
  }
  return { ...booking, payment: method, stage: 'paid' };
}
