import { wait } from '../mocks/flags';
import type { Address, PaymentMethod, User } from '../types';

// The mock keeps account data in app state; these only stand in for the requests the back end will need.

// TODO(backend): PATCH /api/residents/me with the name.
export async function saveProfile(user: User): Promise<User> {
  if (!user.first.trim()) throw new Error('Enter your first name');
  await wait(300);
  return { ...user, first: user.first.trim(), last: user.last.trim() };
}

// TODO(backend): addresses endpoint (create, update, delete).
export async function saveAddress(address: Address): Promise<Address> {
  if (!address.bldg.trim()) throw new Error('Add the building or street');
  await wait(300);
  return {
    ...address,
    label: address.label.trim() || 'Other',
    bldg: address.bldg.trim(),
    unit: address.unit.trim(),
    note: address.note.trim(),
  };
}

// TODO(backend): store the default payment method on the resident.
export async function setDefaultPayment(method: PaymentMethod): Promise<PaymentMethod> {
  await wait(300);
  return method;
}
