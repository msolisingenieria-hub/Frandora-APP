import { test, expect } from "@playwright/test";
import {
  smsConfirmacion,
  smsRecordatorio24h,
  smsRecordatorio2h,
  smsCancelacion,
} from "../../lib/sms/templates";

const BASE = {
  clientName: "María",
  businessName: "Barbería Don Pepe",
  serviceName: "Corte de pelo",
  date: "miércoles 25 de junio",
  time: "14:30",
  bookingCode: "FRN-ABCD",
  publicUrl: "https://barberia-don-pepe.frandora.cl",
};

test.describe("Plantillas de SMS", () => {

  test("smsConfirmacion incluye datos clave", () => {
    const msg = smsConfirmacion(BASE);
    expect(msg).toContain("María");
    expect(msg).toContain("Barbería Don Pepe");
    expect(msg).toContain("FRN-ABCD");
    expect(msg.length).toBeLessThan(320);
  });

  test("smsRecordatorio24h es corto y menciona mañana", () => {
    const msg = smsRecordatorio24h(BASE);
    expect(msg.toLowerCase()).toContain("mañana"); // Mañana/mañana — sin importar casing
    expect(msg.length).toBeLessThan(320);
  });

  test("smsRecordatorio2h menciona 2 horas", () => {
    const msg = smsRecordatorio2h({ clientName: "María", businessName: "Barbería Don Pepe", time: "14:30" });
    expect(msg).toContain("2 hora");
    expect(msg.length).toBeLessThan(320);
  });

  test("smsCancelacion menciona cancelación", () => {
    const msg = smsCancelacion({ clientName: "María", businessName: "Barbería Don Pepe", publicUrl: BASE.publicUrl });
    expect(msg).toContain("cancelad");
    expect(msg.length).toBeLessThan(320);
  });

  test("ningún SMS tiene palabras técnicas en inglés", () => {
    const msgs = [
      smsConfirmacion(BASE),
      smsRecordatorio24h(BASE),
      smsRecordatorio2h({ clientName: "María", businessName: "Barbería Don Pepe", time: "14:30" }),
      smsCancelacion({ clientName: "María", businessName: "Barbería Don Pepe", publicUrl: BASE.publicUrl }),
    ];
    const palabrasProhibidas = ["webhook", "widget", "dashboard", "API", "token", "backend"];
    for (const msg of msgs) {
      for (const palabra of palabrasProhibidas) {
        expect(msg.toLowerCase()).not.toContain(palabra.toLowerCase());
      }
    }
  });

});
