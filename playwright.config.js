const { defineConfig, devices } = require('@playwright/test');

const iphone16ProMax = {
  ...devices['iPhone 15 Pro Max'],
  viewport: { width: 440, height: 956 },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
};

module.exports = defineConfig({
  testDir: 'tests/browser',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'node scripts/test-server.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'webkit-iphone16-pro-max',
      use: {
        ...iphone16ProMax,
        browserName: 'webkit'
      }
    }
  ]
});
