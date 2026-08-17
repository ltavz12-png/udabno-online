import { defineConfig } from '@playwright/test';

/** Smoke E2E for the playable loop. Assumes a dev server on :5180. */
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:5180',
    launchOptions: { executablePath: '/opt/pw-browsers/chromium' },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
