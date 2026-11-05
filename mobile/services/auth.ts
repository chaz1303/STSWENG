import { seedAccount } from '../mocks/account';
import { wait } from '../mocks/flags';
import type { Account } from '../types';

export type Provider = 'Google' | 'Facebook';

// TODO(backend): real OAuth with expo-auth-session using config.googleClientId / config.facebookAppId,
// then exchange the provider token for our JWT (U01 spec).
export async function signInWithProvider(_provider: Provider): Promise<Account> {
  await wait(800);
  return seedAccount();
}

// TODO(backend): POST /api/auth/login (U01 spec); keep the returned JWT in secure storage.
export async function logIn(id: string, password: string): Promise<Account> {
  if (!id.trim()) throw new Error('Enter your email or mobile number.');
  if (!password) throw new Error('Enter your password.');
  await wait(600);
  return seedAccount();
}

// TODO(backend): OTP endpoint (SMS provider is still undecided).
export async function sendCode(phone: string) {
  const n = phone.replace(/\D/g, '');
  if (n.length !== 10 || n[0] !== '9')
    throw new Error('Enter a 10-digit number that starts with 9.');
  await wait(400);
}

// shortcut: any 6 digits pass except 000000, which shows the wrong-code state. Real check is server-side.
export async function verifyCode(_phone: string, code: string): Promise<Account> {
  await wait(400);
  if (code === '000000')
    throw new Error("That code didn't match. Check the latest text from Mang Juan and try again.");
  return seedAccount();
}

// TODO(backend): password reset email (email provider is ICM open item 15).
export async function sendPasswordReset(_email: string) {
  await wait(400);
}

// TODO(backend): the app deletes its token on logout (ICM open item 14); nothing to call yet.
export async function logOut() {}
