import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import {
  notifyConfirmacion,
  notifyCancelacion,
  notifyPostServicio,
} from "@/lib/services/notification.service";
import { prisma } from "@/lib/db/client";

const schema = z.object({
  appointmentId: z.string(),
  tipo: z.enum(["confirmacion", "cancelacion", "post_servicio"]),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { appointmentId, tipo } = parsed.data;

  // Verificar que la cita pertenece al negocio
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, businessId },
    include: {
      business: { select: { slug: true } },
      clients: { include: { client: { select: { email: true, name: true } } }, take: 1 },
    },
  });
  if (!appt) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

  if (tipo === "confirmacion")  await notifyConfirmacion(appointmentId);
  if (tipo === "cancelacion")   await notifyCancelacion(appointmentId);
  if (tipo === "post_servicio") {
    const client = appt.clients[0]?.client;
    if (client?.email) {
      await notifyPostServicio({
        clientEmail:   client.email,
        clientName:    client.name,
        businessName:  appt.business.slug,
        businessSlug:  appt.business.slug,
        appointmentId: appt.id,
      });
    }
  }

  return NextResponse.json({ ok: true, tipo });
}
