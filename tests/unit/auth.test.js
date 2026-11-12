import { describe, expect, it } from 'vitest';
import {
  TOKEN_TTL,
  hashPassword,
  normalizeMobile,
  signToken,
  validateLogin,
  validateRegister,
  verifyPassword,
  verifyToken,
} from '../../src/services/auth.js';

const SECRET = 'unit-test-secret-unit-test-secret-1234';
const good = {
  email: ' Juan@Example.com ',
  mobile_number: '0917 123 4567',
  password: 'Secret#123',
  full_name: ' Juan Dela Cruz ',
};

describe('passwords', () => {
  it('verifies the right password and rejects the wrong one', () => {
    const hash = hashPassword('Secret#123');
    expect(hash).not.toContain('Secret#123');
    expect(verifyPassword('Secret#123', hash)).toBe(true);
    expect(verifyPassword('Secret#124', hash)).toBe(false);
  });
  it('salts each hash', () =>
    expect(hashPassword('Secret#123')).not.toBe(hashPassword('Secret#123')));
  it('rejects a stored value it does not understand', () => {
    expect(verifyPassword('x', 'plaintext')).toBe(false);
    expect(verifyPassword('x', undefined)).toBe(false);
  });
});

describe('tokens', () => {
  const now = 1_800_000_000;
  it('round-trips the resident id and expires after 7 days', () => {
    const t = signToken('resident-1', SECRET, now);
    expect(verifyToken(t, SECRET, now + 60)).toMatchObject({
      sub: 'resident-1',
      role: 'resident',
      purpose: 'access',
    });
    expect(verifyToken(t, SECRET, now + TOKEN_TTL)).toBeNull();
  });
  it('rejects a changed payload, another secret and junk', () => {
    const [h, , s] = signToken('resident-1', SECRET, now).split('.');
    const forged = Buffer.from(
      JSON.stringify({ sub: 'resident-2', purpose: 'access', exp: now + 999 }),
    ).toString('base64url');
    expect(verifyToken(`${h}.${forged}.${s}`, SECRET, now)).toBeNull();
    expect(
      verifyToken(signToken('resident-1', 'another-secret-another-secret-12345', now), SECRET, now),
    ).toBeNull();
    for (const junk of ['', 'a.b', 'a.b.c.d', undefined])
      expect(verifyToken(junk, SECRET, now)).toBeNull();
  });
  it('rejects an unsigned ("alg: none") token', () => {
    const head = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({ sub: 'x', purpose: 'access', exp: now + 999 }),
    ).toString('base64url');
    expect(verifyToken(`${head}.${body}.`, SECRET, now)).toBeNull();
  });
});

describe('normalizeMobile', () => {
  it('stores every PH format the same way', () => {
    for (const n of [
      '09171234567',
      '9171234567',
      '+639171234567',
      '639171234567',
      '0917 123 4567',
      '(0917) 123-4567',
    ])
      expect(normalizeMobile(n)).toBe('+639171234567');
  });
  it('rejects anything else', () => {
    for (const n of ['', '12345', '08171234567', '+14155550123', '0917123456', null, undefined])
      expect(normalizeMobile(n)).toBeNull();
  });
});

describe('validateRegister', () => {
  it('trims, lowercases and normalizes', () => {
    expect(validateRegister(good).value).toEqual({
      email: 'juan@example.com',
      mobile_number: '+639171234567',
      password: 'Secret#123',
      full_name: 'Juan Dela Cruz',
    });
  });
  it('names every bad field', () => {
    expect(Object.keys(validateRegister({}).fields).sort()).toEqual([
      'email',
      'full_name',
      'mobile_number',
      'password',
    ]);
    expect(validateRegister(null).fields).toBeDefined();
  });
  it('applies the PRD password rule', () => {
    for (const password of ['Sh#1', 'nouppercase#1', 'NoNumber#x', 'NoSpecial123', 12345678])
      expect(validateRegister({ ...good, password }).fields).toHaveProperty('password');
  });
});

describe('validateLogin', () => {
  it('accepts a mobile number or an email', () => {
    expect(validateLogin({ mobile_number: '9171234567', password: 'x' }).value).toEqual({
      mobile_number: '+639171234567',
      password: 'x',
    });
    expect(validateLogin({ email: 'Juan@Example.com', password: 'x' }).value).toEqual({
      email: 'juan@example.com',
      password: 'x',
    });
  });
  it('rejects a bad number, a missing identifier and a missing password', () => {
    expect(validateLogin({ mobile_number: '123', password: 'x' }).fields).toHaveProperty(
      'mobile_number',
    );
    expect(validateLogin({ password: 'x' }).fields).toHaveProperty('email');
    expect(validateLogin({ email: 'juan@example.com' }).fields).toHaveProperty('password');
    expect(validateLogin(undefined).fields).toBeDefined();
  });
});
