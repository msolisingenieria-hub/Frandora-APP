import { auth }         from "@clerk/nextjs/server";
import { NextResponse }  from "next/server";
import { z }             from "zod";
import { prisma }        from "@/lib/db/client";
import { getBusinessId } from "@/lib/auth/business";

const Schema = z.object({
  method:   z.enum(["CASH", "CARD", "TRANSFER", "QR", "GIFT_CARD", "MIXED"]),
  amount:   z.number().positive(),
  tip:      z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body   = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt || appt.businessId !== businessId) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  }

  const { method, amount, tip, discount } = parsed.data;
  const total = Math.max(amount + tip - discount, 0);

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        businessId,
        appointmentId: id,
        method:   method as "CASH" | "CARD" | "TRANSFER" | "QR" | "GIFT_CARD" | "MIXED",
        amount,
        total,
        tip,
        discount,
        status: "COMPLETED",
      },
    }),
    prisma.appointment.update({
      where: { id },
      data:  { status: "COMPLETED" },
    }),
  ]);

  return NextResponse.json({ paymentId: payment.id, total });
}
