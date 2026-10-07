import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 35000,
  expect: { timeout: 10000 },
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    serviceWorkers: 'block'
  },
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1 --directory out',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
