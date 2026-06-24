import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const InviteSchema = z.object({
  name:  z.string().min(1),
  email: z.string().email(),
  role:  z.enum(["MANAGER","STAFF","RECEPTIONIST"]).default("STAFF"),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Crear el profesional como pendiente de vinculación
  const staff = await prisma.staffMember.create({
    data: {
      businessId,
      name:  parsed.data.name,
      email: parsed.data.email,
      role:  parsed.data.role as never,
    },
  });

  // TODO Fase 10: enviar email de invitación con Resend
  // await sendInviteEmail({ to: parsed.data.email, businessName: business?.name, staffId: staff.id })

  return NextResponse.json({ ok: true, staff, message: `Invitación registrada para ${parsed.data.email}` }, { status: 201 });
}
