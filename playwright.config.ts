import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const CI = !!process.env.CI;

// End-to-end tests drive the production build (npm run build + preview), so they
// also check what only exists there, such as the Content-Security-Policy.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}/puppy/`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/puppy/`,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
