import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPublicAppointment } from "@/lib/services/appointment.service";
import { notifyConfirmacion } from "@/lib/services/notification.service";

const BodySchema = z.object({
  businessId:  z.string().min(1),
  serviceId:   z.string().min(1),
  staffId:     z.string().nullable().optional(),
  startTime:   z.string().min(1),
  clientName:  z.string().min(2, "Nombre requerido"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().min(8, "Teléfono requerido"),
  notes:       z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const result = await createPublicAppointment({
      ...parsed.data,
      staffId: parsed.data.staffId ?? null,
    });

    // Enviar confirmación sin bloquear la respuesta
    notifyConfirmacion(result.appointmentId).catch(() => null);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[appointments/public] POST error:", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
