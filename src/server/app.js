import express from 'express';

// Exported without listen() so Supertest and the Vite dev server can mount it.
export const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
