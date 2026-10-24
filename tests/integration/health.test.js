import { expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/app.js';

it('GET /api/health responds ok', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});
