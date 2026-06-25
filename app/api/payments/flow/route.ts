import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { prisma } from "@/lib/db/client";
import { initiateBookingPayment } from "@/lib/services/payment.service";

const schema = z.object({
  appointmentId: z.string().min(1),
  clientEmail: z.string().email(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { appointmentId, clientEmail } = parsed.data;

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, businessId },
    include: { services: { select: { serviceName: true } } },
  });
  if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

  const description = appointment.services[0]?.serviceName ?? "Reserva Frandora";

  const result = await initiateBookingPayment({
    appointmentId,
    businessId,
    clientEmail,
    amount: appointment.totalPrice,
    description,
  });

  return NextResponse.json(result);
}
