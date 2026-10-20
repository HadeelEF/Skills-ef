import { defineConfig, devices } from '@playwright/test';

// Not executed in the skill authoring environment: requires the .NET API, a seeded database
// and an identity provider test tenant. See README "Evidence".
export default defineConfig({
  testDir: './e2e',
  retries: 0, // a flaky journey is a bug to investigate, not something to retry away
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:5001',
    locale: 'ar-SA',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
