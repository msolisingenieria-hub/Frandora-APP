import { test, expect } from "@playwright/test";

test.describe("Landing page pública", () => {
  test("carga correctamente y muestra el título principal", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Frandora/i);
    // Hero visible
    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();
  });

  test("tiene sección de precios con los planes correctos", async ({ page }) => {
    await page.goto("/");
    const body = await page.textContent("body");
    expect(body).toContain("Starter");
    expect(body).toContain("Professional");
    expect(body).toContain("Business");
  });

  test("botón 'Comenzar gratis' existe y es clickeable", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("a, button").filter({ hasText: /Comienza gratis|Comenzar gratis|Empezar/i }).first();
    await expect(btn).toBeVisible();
  });

  test("es responsive — viewport mobile no tiene overflow horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
