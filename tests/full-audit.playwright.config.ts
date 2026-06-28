/**
 * Playwright config para la auditoría completa del sistema Frandora en producción.
 *
 * Alcance:
 *  - frandora.cl              (landing page pública)
 *  - app.frandora.cl          (auth + onboarding + dashboard completo)
 *  - admin.frandora.cl        (super admin)
 *  - barberia-don-pepe.frandora.cl (página pública de reservas — slug de prueba)
 *  - app.frandora.cl/cliente/[token] (portal del cliente con token inválido)
 *
 * No arranca servidor local — apunta directamente a producción.
 * No hay sesión autenticada: las páginas protegidas se verifican sin auth.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testMatch: "**/full-audit.spec.ts",
  fullyParallel: false,
  forbidOnly: false,
  retries: 1,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "tests/full-audit-report" }],
  ],
  timeout: 35_000,
  use: {
    // URL base para navegaciones relativas (cuando corresponda)
    baseURL: "https://frandora.cl",
    trace: "retain-on-failure",
    screenshot: "on",
    video: "off",
    actionTimeout: 12_000,
    navigationTimeout: 25_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "chromium-tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
  // Sin webServer — los tests apuntan a producción
});
