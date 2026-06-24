import { test, expect } from "@playwright/test";

const CRON_SECRET = process.env.CRON_SECRET ?? "laclaveesfrandora123456789";

test.describe("API de notificaciones", () => {

  test("GET /api/notifications/reminders sin clave retorna 401", async ({ request }) => {
    const res = await request.get("/api/notifications/reminders");
    expect(res.status()).toBe(401);
  });

  test("GET /api/notifications/reminders con clave correcta retorna 200", async ({ request }) => {
    const res = await request.get("/api/notifications/reminders", {
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    });
    // 200 aunque no haya citas pendientes
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ok", true);
    expect(body).toHaveProperty("enviados");
  });

  test("POST /api/notifications/reminders con clave correcta retorna 200", async ({ request }) => {
    const res = await request.post("/api/notifications/reminders", {
      headers: { authorization: `Bearer ${CRON_SECRET}` },
    });
    expect(res.status()).toBe(200);
  });

});
