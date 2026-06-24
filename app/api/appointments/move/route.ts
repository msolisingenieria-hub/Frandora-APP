import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const MoveSchema = z.object({
  appointmentId: z.string(),
  startTime:     z.string().datetime(),
  endTime:       z.string().datetime(),
  staffId:       z.string().optional(),
});

// PATCH — mover cita (drag & drop del calendario)
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body   = await req.json();
  const parsed = MoveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Verificar que la cita pertenece al negocio
  const appt = await prisma.appointment.findFirst({
    where: { id: parsed.data.appointmentId, businessId },
  });
  if (!appt) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

  const updated = await prisma.appointment.update({
    where: { id: parsed.data.appointmentId },
    data: {
      startTime: new Date(parsed.data.startTime),
      endTime:   new Date(parsed.data.endTime),
      ...(parsed.data.staffId !== undefined ? { staffId: parsed.data.staffId } : {}),
    },
  });

  return NextResponse.json(updated);
}
