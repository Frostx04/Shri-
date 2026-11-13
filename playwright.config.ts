import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4173/Shri-/', trace: 'off', ...devices['iPhone 13'], browserName: 'chromium' },
  webServer: { command: 'npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/Shri-/', reuseExistingServer: true },
});
