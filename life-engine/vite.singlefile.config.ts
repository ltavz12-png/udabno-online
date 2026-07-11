import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Single-file build: inlines all JS/CSS into one self-contained index.html so the
 * app can be embedded where external requests are blocked (e.g. a sandboxed
 * artifact). The in-browser LocalRgsClient means no backend is needed.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  css: { postcss: { plugins: [] } },
  build: {
    target: 'es2020',
    outDir: 'dist-single',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
});
