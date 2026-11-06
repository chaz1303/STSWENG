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

// TODO(backend): OTP endpoint (SMS provider is still undecided). Flow 4 sends the code and signs in from
// one sheet; the mock skips the code step.
export async function logInWithPhone(phone: string): Promise<Account> {
  const n = phone.replace(/\D/g, '').replace(/^(63|0)/, '');
  if (n.length !== 10 || n[0] !== '9')
    throw new Error('Enter a 10-digit PH mobile number starting with 9.');
  await wait(600);
  return seedAccount();
}

// TODO(backend): POST /api/auth/register (U01 spec).
export async function signUp(name: string, id: string, password: string): Promise<Account> {
  if (!name.trim()) throw new Error('Enter your full name.');
  if (!id.trim()) throw new Error('Enter your email or mobile number.');
  if (password.length < 8) throw new Error('Use at least 8 characters for your password.');
  await wait(600);
  // A new resident keeps their own name; the rest is the mock account.
  const seed = seedAccount();
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
  return { ...seed, user: { ...seed.user, name: name.trim(), initials }, past: [] };
}

// TODO(backend): password reset email (email provider is ICM open item 15).
export async function sendPasswordReset(email: string) {
  if (!email.includes('@')) throw new Error('Enter the email you signed up with.');
  await wait(400);
}

// TODO(backend): the app deletes its token on logout (ICM open item 14); nothing to call yet.
export async function logOut() {}
