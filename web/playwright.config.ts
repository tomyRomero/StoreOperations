import { defineConfig, devices } from "@playwright/test";

// End-to-end tests: real browsers against the whole store running locally. The API (seeded with the demo
// store), this app, Mailpit and the Stripe CLI's webhook relay must be running first; see the README.
// The tests share one database, so they run one at a time.
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/support/global-setup.ts",
  workers: 1,
  // Generous, because the store under test is often a busy development machine
  timeout: 120_000,
  expect: { timeout: 30_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3200",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
