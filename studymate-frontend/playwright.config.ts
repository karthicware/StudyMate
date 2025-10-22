import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for StudyMate Angular application
 * Configured for E2E testing with backend integration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Global timeout for each test
  timeout: 30000,

  // Expect timeout for assertions
  expect: {
    timeout: 5000,
  },

  use: {
    baseURL: 'http://localhost:4200',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Longer timeout for actions that involve backend API calls
    actionTimeout: 10000,
    navigationTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Note: Testing strategy focuses on Chrome/Chromium only
    // Firefox and Safari testing removed as of 2025-10-18
    // See docs/testing/e2e-testing-guide.md for rationale
  ],

  // Start both frontend and backend servers for E2E tests
  webServer: [
    {
      command: 'npx ng serve --configuration=test',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    // TEMPORARILY COMMENTED: Backend started manually via scripts/start-test-server.sh
    // {
    //   command: 'cd ../studymate-backend && ./scripts/start-test-server.sh',
    //   url: 'http://localhost:8081/auth/register',
    //   reuseExistingServer: !process.env.CI,
    //   timeout: 120000,
    //   ignoreHTTPSErrors: true,
    // },
  ],
});
