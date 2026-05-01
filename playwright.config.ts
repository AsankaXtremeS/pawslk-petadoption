import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "test",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:8080",
    trace: "on",
    screenshot: "only-on-failure",
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
  },
});
