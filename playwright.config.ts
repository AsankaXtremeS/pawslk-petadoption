import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "test",
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:8080",
    trace: "on-first-retry",
    ...devices['Desktop Chrome'],
  },
});
