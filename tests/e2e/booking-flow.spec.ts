import { test, expect } from "@playwright/test";

test.describe("Flujo de reserva pública", () => {

  test("POST /api/appointments/public sin datos retorna 422", async ({ request }) => {
    const res = await request.post("/api/appointments/public", {
      data: {},
    });
    expect(res.status()).toBe(422);
  });

  test("POST /api/appointments/public con email inválido retorna 422", async ({ request }) => {
    const res = await request.post("/api/appointments/public", {
      data: {
        businessId: "test-id",
        serviceId: "test-service",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        clientName: "Juan Pérez",
        clientEmail: "no-es-email",
        clientPhone: "912345678",
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("POST /api/appointments/public con negocio inexistente retorna 500 o 404", async ({ request }) => {
    const res = await request.post("/api/appointments/public", {
      data: {
        businessId: "negocio-que-no-existe-jamás",
        serviceId: "servicio-que-no-existe",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        clientName: "Juan Pérez",
        clientEmail: "juan@test.com",
        clientPhone: "912345678",
      },
    });
    // DB error esperado: 500
    expect([404, 500]).toContain(res.status());
  });

});
