import { test, expect } from "@playwright/test";
import {
  confirmationEmail,
  reminderEmail,
  cancellationEmail,
  welcomeClientEmail,
  postServiceEmail,
  type AppointmentEmailData,
} from "../../lib/email/templates";

const DATA: AppointmentEmailData = {
  clientName: "María González",
  businessName: "Barbería Don Pepe",
  serviceName: "Corte de pelo",
  staffName: "Pedro Soto",
  date: "miércoles 25 de junio",
  time: "14:30",
  bookingCode: "FRN-2026-ABCD",
  publicUrl: "https://barberia-don-pepe.frandora.cl",
};

test.describe("Plantillas de correo", () => {

  test("confirmationEmail genera HTML con datos del cliente", () => {
    const html = confirmationEmail(DATA);
    expect(html).toContain("María González");
    expect(html).toContain("Barbería Don Pepe");
    expect(html).toContain("Corte de pelo");
    expect(html).toContain("FRN-2026-ABCD");
    expect(html).toContain("confirmada");
  });

  test("reminderEmail 24h genera HTML con aviso de mañana", () => {
    const html = reminderEmail(DATA, 24);
    expect(html).toContain("María González");
    expect(html).toContain("mañana");
    expect(html).toContain("FRN-2026-ABCD");
  });

  test("reminderEmail 2h genera HTML con aviso de 2 horas", () => {
    const html = reminderEmail(DATA, 2);
    expect(html).toContain("2 horas");
  });

  test("cancellationEmail menciona la cancelación", () => {
    const html = cancellationEmail(DATA);
    expect(html).toContain("cancelada");
    expect(html).toContain("María González");
  });

  test("welcomeClientEmail da bienvenida al cliente", () => {
    const html = welcomeClientEmail({
      clientName: "María González",
      businessName: "Barbería Don Pepe",
      publicUrl: "https://barberia-don-pepe.frandora.cl",
    });
    expect(html).toContain("Bienvenid"); // Bienvenido/a — sin importar género
    expect(html).toContain("Barbería Don Pepe");
  });

  test("postServiceEmail pide opinión", () => {
    const html = postServiceEmail({
      clientName: "María González",
      businessName: "Barbería Don Pepe",
      reviewUrl: "https://barberia-don-pepe.frandora.cl/opinion/test-id",
      rebookUrl: "https://barberia-don-pepe.frandora.cl",
    });
    expect(html).toContain("María González");
    expect(html).toContain("opinión");
  });

  test("todos los correos tienen estructura HTML válida con referencia a frandora.cl", () => {
    const htmls = [
      confirmationEmail(DATA),
      reminderEmail(DATA, 24),
      reminderEmail(DATA, 2),
      cancellationEmail(DATA),
      welcomeClientEmail({ clientName: "Test", businessName: "Test Business", publicUrl: "https://test.frandora.cl" }),
      postServiceEmail({ clientName: "Test", businessName: "Test Business", reviewUrl: "https://test.frandora.cl/opinion/x", rebookUrl: "https://test.frandora.cl" }),
    ];
    for (const html of htmls) {
      expect(html).toContain("<!DOCTYPE html");
      expect(html).toContain("</html>");
      expect(html).toContain("frandora.cl");
    }
  });

});
