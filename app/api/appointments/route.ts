import { auth }         from "@clerk/nextjs/server";
import { NextResponse }  from "next/server";
import { prisma }        from "@/lib/db/client";
import { getBusinessId } from "@/lib/auth/business";
import { z }             from "zod";
import { getAppointmentsForDashboard } from "@/lib/services/appointment.service";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const url  = new URL(req.url);
  const from = url.searchParams.get("from");
  const to   = url.searchParams.get("to");

  const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
  const toDate   = to   ? new Date(to)   : new Date(new Date().setMonth(new Date().getMonth() + 2));

  const appointments = await getAppointmentsForDashboard(businessId, fromDate, toDate);
  return NextResponse.json(appointments);
}

const CreateSchema = z.object({
  staffId:       z.string().nullable().optional(),
  serviceId:     z.string(),
  clientId:      z.string().optional(),
  clientName:    z.string().min(1).optional(),
  clientPhone:   z.string().optional(),
  clientEmail:   z.string().email().optional(),
  startTime:     z.string().datetime(),
  endTime:       z.string().datetime(),
  totalPrice:    z.number().min(0).optional(),
  notes:         z.string().max(500).optional(),
  internalNotes: z.string().max(500).optional(),
  status:        z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS"]).default("CONFIRMED"),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body   = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });

  const { staffId, serviceId, clientId, clientName, clientPhone, clientEmail, startTime, endTime, totalPrice, notes, internalNotes, status } = parsed.data;

  // Upsert cliente si no existe
  let resolvedClientId = clientId ?? null;
  if (!resolvedClientId && clientName) {
    const client = await prisma.client.upsert({
      where: { businessId_email: clientEmail ? { businessId, email: clientEmail } : { businessId, email: "__no_email__" } },
      update: { name: clientName, phone: clientPhone ?? undefined },
      create: { businessId, name: clientName, email: clientEmail ?? null, phone: clientPhone ?? null },
    }).catch(async () =>
      prisma.client.create({ data: { businessId, name: clientName, email: clientEmail ?? null, phone: clientPhone ?? null } })
    );
    resolvedClientId = client.id;
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { name: true, duration: true, price: true } });
  if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

  const start = new Date(startTime);
  const end   = endTime ? new Date(endTime) : new Date(start.getTime() + service.duration * 60000);

  const appointment = await prisma.appointment.create({
    data: {
      businessId,
      staffId:       staffId ?? null,
      startTime:     start,
      endTime:       end,
      status:        status as "PENDING" | "CONFIRMED" | "IN_PROGRESS",
      totalPrice:    totalPrice ?? service.price,
      notes:         notes ?? null,
      internalNotes: internalNotes ?? null,
      bookingCode:   Math.random().toString(36).slice(2, 10).toUpperCase(),
      source:        "DASHBOARD",
      services: {
        create: [{ serviceId, serviceName: service.name, duration: service.duration, price: service.price }],
      },
      ...(resolvedClientId ? {
        clients: { create: { clientId: resolvedClientId } },
      } : {}),
    },
  });

  return NextResponse.json({ id: appointment.id, status: appointment.status }, { status: 201 });
}
