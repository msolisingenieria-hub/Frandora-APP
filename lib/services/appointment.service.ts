import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { addMinutes } from "date-fns";

export type CreatePublicAppointmentInput = {
  businessId: string;
  serviceId: string;
  staffId: string | null;
  startTime: string;
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
  staffId: string | null;
  staffName: string | null;
  staffColor: string | null;
  internalNotes: string | null;
  businessName: string | null;
  services: { name: string; duration: number; price: number }[];
  clientName: string | null;
  clientPhone: string | null;
};

/**
 * Resuelve el businessId a partir del slug público del negocio.
 * Se usa para que la reserva pública NO confíe en un businessId enviado
 * por el cliente: el negocio se determina server-side desde el slug.
 * Retorna null si el slug no existe o el negocio no está activo.
 */
export async function resolveBusinessIdBySlug(slug: string): Promise<string | null> {
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!business) return null;
  if (business.status !== "ACTIVE") return null;
  return business.id;
}

export async function createPublicAppointment(input: CreatePublicAppointmentInput) {
  const { businessId, serviceId, staffId, startTime, clientName, clientEmail, clientPhone, notes } = input;
  const start = new Date(startTime);

  if (Number.isNaN(start.getTime())) {
    throw new Error("Fecha u horario invalido");
  }

  if (start < new Date()) {
    throw new Error("No puedes reservar un horario que ya paso");
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const service = await tx.service.findFirst({
      where: { id: serviceId, businessId, isActive: true, isOnline: true },
      select: { id: true, name: true, duration: true, price: true },
    });
    if (!service) throw new Error("Servicio no disponible");

    const end = addMinutes(start, service.duration);
    const staff = staffId
      ? await tx.staffMember.findFirst({
          where: {
            id: staffId,
            businessId,
            isActive: true,
            services: { some: { serviceId } },
          },
          select: { id: true, name: true },
        })
      : null;

    if (staffId && !staff) {
      throw new Error("Profesional no disponible para este servicio");
    }

    const conflictingAppointment = await tx.appointment.findFirst({
      where: {
        businessId,
        ...(staffId ? { staffId } : {}),
        status: { notIn: ["CANCELED", "NO_SHOW"] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: { id: true },
    });

    if (conflictingAppointment) {
      throw new Error("Este horario ya no esta disponible");
    }

    const client = await tx.client.upsert({
      where: { businessId_email: { businessId, email: clientEmail } },
      update: {
        name: clientName.trim(),
        phone: clientPhone || null,
      },
      create: {
        businessId,
        name: clientName.trim(),
        email: clientEmail,
        phone: clientPhone || null,
      },
    });

    return tx.appointment.create({
      data: {
        businessId,
        staffId: staff?.id ?? null,
        status: "PENDING",
        startTime: start,
        endTime: end,
        totalPrice: service.price,
        notes: notes || null,
        source: "ONLINE",
        services: {
          create: {
            serviceId: service.id,
            serviceName: service.name,
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
        services: { select: { serviceName: true } },
      },
    });
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });

  return {
    bookingCode: appointment.bookingCode,
    appointmentId: appointment.id,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
    staffName: appointment.staff?.name ?? "Cualquier profesional",
    serviceName: appointment.services[0]?.serviceName ?? "Servicio",
  };
}

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
      staff: { select: { id: true, name: true, color: true } },
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
    id: a.id,
    bookingCode: a.bookingCode,
    status: a.status,
    startTime: a.startTime,
    endTime: a.endTime,
    totalPrice: a.totalPrice,
    source: a.source,
    staffId: a.staff?.id ?? null,
    staffName: a.staff?.name ?? null,
    staffColor: a.staff?.color ?? null,
    internalNotes: a.internalNotes,
    businessName: a.business?.name ?? null,
    services: a.services.map((s) => ({
      name: s.serviceName,
      duration: s.duration,
      price: s.price,
    })),
    clientName: a.clients[0]?.client.name ?? null,
    clientPhone: a.clients[0]?.client.phone ?? null,
  }));
}
