import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Bundles the welcome animations (src/anim, React + React Bits + GSAP) into src/web/anim.js and anim.css.
// The PWA is served as static files with no build step, so the bundle is committed.
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  publicDir: false,
  build: {
    outDir: 'src/web',
    emptyOutDir: false,
    lib: {
      entry: 'src/anim/main.jsx',
      formats: ['iife'],
      name: 'mjAnim',
      fileName: () => 'anim.js',
      cssFileName: 'anim',
    },
  },
});
