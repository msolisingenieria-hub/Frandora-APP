import { test, expect } from "@playwright/test";

test.describe("API de servicios", () => {

  test("GET /api/services sin auth retorna 401", async ({ request }) => {
    const res = await request.get("/api/services");
    expect(res.status()).toBe(401);
  });

});

test.describe("API de ajustes", () => {

  test("GET /api/settings sin auth retorna 401", async ({ request }) => {
    const res = await request.get("/api/settings");
    expect(res.status()).toBe(401);
  });

});

test.describe("API de estadísticas del dashboard", () => {

  test("GET /api/dashboard/stats sin auth retorna 401", async ({ request }) => {
    const res = await request.get("/api/dashboard/stats");
    expect(res.status()).toBe(401);
  });

});
