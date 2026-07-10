import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Override PostCSS discovery so we don't inherit the parent app's config.
  css: { postcss: { plugins: [] } },
  server: { port: 5180, host: true },
  build: { target: 'es2020', sourcemap: false },
});
