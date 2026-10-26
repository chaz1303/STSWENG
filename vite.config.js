import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { app } from './src/server/app.js';

export default defineConfig({
  root: 'src/client',
  build: { outDir: '../../dist', emptyOutDir: true },
  plugins: [
    react(),
    {
      // Serves the Express API inside the Vite dev server, so `npm run dev` is one process.
      name: 'api-in-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) =>
          req.url.startsWith('/api') ? app(req, res, next) : next(),
        );
      },
    },
  ],
});
