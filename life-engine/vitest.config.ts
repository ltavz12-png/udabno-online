import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Override PostCSS discovery so we don't inherit the parent app's config.
  css: { postcss: { plugins: [] } },
  test: {
    include: ['engine/**/*.test.ts'],
    environment: 'node',
    testTimeout: 120_000,
  },
});
