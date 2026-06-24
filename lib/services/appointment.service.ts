import { prisma } from "@/lib/db/client";
import { addMinutes } from "date-fns";

export type CreatePublicAppointmentInput = {
  businessId: string;
  serviceId: string;
  staffId: string | null;
  startTime: string;        // ISO string
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
};

export type AppointmentListItem = {
  id: string;
  bookingCode: string;
  status: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  source: string;
  staffId:       string | null;
  staffName:     string | null;
  staffColor:    string | null;
  internalNotes: string | null;
  businessName:  string | null;
  services: { name: string; duration: number; price: number }[];
  clientName:  string | null;
  clientPhone: string | null;
};

// Crea una cita desde el flujo público de reservas
export async function createPublicAppointment(
  input: CreatePublicAppointmentInput
) {
  const { businessId, serviceId, staffId, startTime, clientName, clientEmail, clientPhone, notes } = input;

  // Obtener el servicio
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true, name: true, duration: true, price: true },
  });
  if (!service) throw new Error("Servicio no encontrado");

  const start = new Date(startTime);
  const end   = addMinutes(start, service.duration);

  // Buscar o crear Client (usa campo "name" según schema)
  let client = await prisma.client.findFirst({
    where: { businessId, email: clientEmail || undefined },
  });
  if (!client) {
    client = await prisma.client.create({
      data: {
        businessId,
        name: clientName.trim(),
        email: clientEmail || null,
        phone: clientPhone || null,
      },
    });
  }

  // Crear la cita con los servicios y cliente anidados
  const appointment = await prisma.appointment.create({
    data: {
      businessId,
      staffId: staffId || null,
      status: "PENDING",
      startTime: start,
      endTime: end,
      totalPrice: service.price,
      notes: notes || null,
      source: "ONLINE",
      services: {
        create: {
          serviceId: service.id,
          serviceName: service.name,   // campo requerido por schema
          price: service.price,
          duration: service.duration,
        },
      },
      clients: {
        create: { clientId: client.id },
      },
    },
    include: {
      staff: { select: { name: true } },
    },
  });

  return {
    bookingCode: appointment.bookingCode,
    appointmentId: appointment.id,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
    staffName: appointment.staff?.name ?? "Cualquier profesional",
    serviceName: service.name,
  };
}

// Lista citas del negocio para el dashboard (rango de fechas)
export async function getAppointmentsForDashboard(
  businessId: string,
  from: Date,
  to: Date
): Promise<AppointmentListItem[]> {
  const appts = await prisma.appointment.findMany({
    where: {
      businessId,
      startTime: { gte: from, lte: to },
    },
    include: {
      business: { select: { name: true } },
      staff:    { select: { id: true, name: true, color: true } },
      services: {
        select: {
          serviceName: true,
          duration: true,
          price: true,
        },
      },
      clients: {
        include: {
          client: { select: { name: true, phone: true } },
        },
        take: 1,
      },
    },
    orderBy: { startTime: "asc" },
  });

  return appts.map((a) => ({
    id:            a.id,
    bookingCode:   a.bookingCode,
    status:        a.status,
    startTime:     a.startTime,
    endTime:       a.endTime,
    totalPrice:    a.totalPrice,
    source:        a.source,
    staffId:       a.staff?.id    ?? null,
    staffName:     a.staff?.name  ?? null,
    staffColor:    a.staff?.color ?? null,
    internalNotes: a.internalNotes,
    businessName:  a.business?.name ?? null,
    services: a.services.map((s) => ({
      name:     s.serviceName,
      duration: s.duration,
      price:    s.price,
    })),
    clientName:  a.clients[0]?.client.name  ?? null,
    clientPhone: a.clients[0]?.client.phone ?? null,
  }));
}
