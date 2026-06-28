/**
 * Playwright config para la auditoría del admin en producción.
 * No arranca servidor local — apunta directamente a admin.frandora.cl.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testMatch: "**/admin-audit.spec.ts",
  fullyParallel: false,
  forbidOnly: false,
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "tests/admin-audit-report" }]],
  timeout: 30_000,
  use: {
    baseURL: "https://admin.frandora.cl",
    trace: "retain-on-failure",
    screenshot: "on",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  // Sin webServer — los tests apuntan a producción
});
