import { test, expect } from "@playwright/test";

const futureISO = () => new Date(Date.now() + 86400000).toISOString();

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
        slug: "negocio-demo",
        serviceId: "test-service",
        startTime: futureISO(),
        clientName: "Juan Pérez",
        clientEmail: "no-es-email",
        clientPhone: "912345678",
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("POST /api/appointments/public con honeypot relleno retorna 422", async ({ request }) => {
    const res = await request.post("/api/appointments/public", {
      data: {
        slug: "negocio-demo",
        serviceId: "test-service",
        startTime: futureISO(),
        clientName: "Bot Spammer",
        clientEmail: "bot@test.com",
        clientPhone: "912345678",
        hp: "http://spam.example.com", // bot rellenó el honeypot
      },
    });
    expect(res.status()).toBe(422);
  });

  test("POST /api/appointments/public sin slug retorna 422", async ({ request }) => {
    const res = await request.post("/api/appointments/public", {
      data: {
        serviceId: "test-service",
        startTime: futureISO(),
        clientName: "Juan Pérez",
        clientEmail: "juan@test.com",
        clientPhone: "912345678",
      },
    });
    expect(res.status()).toBe(422);
  });

  test("POST /api/appointments/public con negocio inexistente retorna 404", async ({ request }) => {
    const res = await request.post("/api/appointments/public", {
      data: {
        slug: "negocio-que-no-existe-jamas",
        serviceId: "servicio-que-no-existe",
        startTime: futureISO(),
        clientName: "Juan Pérez",
        clientEmail: "juan@test.com",
        clientPhone: "912345678",
      },
    });
    // El negocio se resuelve por slug server-side: slug inexistente => 404 limpio.
    expect(res.status()).toBe(404);
  });

});
