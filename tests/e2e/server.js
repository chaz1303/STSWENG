// E2E server: the built PWA (dist/) in front of the real API on the in-memory store, so the
// user-story suite never touches a database. `vite preview` alone has no /api.
import express from 'express';
import { fileURLToPath } from 'node:url';
import { createApp } from '../../src/server/app.js';
import { memoryStore } from '../helpers/memoryStore.js';

const dist = fileURLToPath(new URL('../../dist', import.meta.url));
const port = Number(process.env.E2E_PORT ?? 4174);

express()
  .use(express.static(dist))
  .use(
    createApp({
      store: memoryStore(),
      secret: () => 'e2e-secret-e2e-secret-e2e-secret-1234',
      // The mock aide API stands in for Team 2's app, so suites can make offers and move jobs along.
      mockAide: true,
      mockAideKey: 'e2e-mock-aide-key',
    }),
  )
  .listen(port, () => console.log(`e2e server on http://localhost:${port}`));
