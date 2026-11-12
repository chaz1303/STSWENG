import { expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/app.js';

it('GET /api/health responds ok', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});

it('sends security headers, with a CSP that blocks inline scripts', async () => {
  const res = await request(app).get('/api/health');
  const csp = res.headers['content-security-policy'];
  expect(csp).toContain("script-src 'self';");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(res.headers['x-content-type-options']).toBe('nosniff');
  expect(res.headers['strict-transport-security']).toMatch(/max-age=\d+/);
});
