import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  status:        z.string().optional(),
  internalNotes: z.string().optional(),
  notes:         z.string().optional(),
  staffId:       z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const appt = await prisma.appointment.findFirst({ where: { id, businessId } });
  if (!appt) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status        !== undefined) updateData.status        = parsed.data.status;
  if (parsed.data.internalNotes !== undefined) updateData.internalNotes = parsed.data.internalNotes;
  if (parsed.data.notes         !== undefined) updateData.notes         = parsed.data.notes;
  if (parsed.data.staffId       !== undefined) updateData.staffId       = parsed.data.staffId ?? null;

  const updated = await prisma.appointment.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const appt = await prisma.appointment.findFirst({ where: { id, businessId } });
  if (!appt) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

  await prisma.appointment.update({ where: { id }, data: { status: "CANCELED" } });
  return NextResponse.json({ ok: true });
}
