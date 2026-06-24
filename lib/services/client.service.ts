import { prisma } from "@/lib/db/client";

export type ClientListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  tags: string[];
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: Date;
  totalAppointments: number;
  lastVisit: Date | null;
};

export type ClientDetail = ClientListItem & {
  birthdate: Date | null;
  gender: string | null;
  notes: string | null;
  allergies: string | null;
  preferences: string | null;
  referredBy: string | null;
  source: string | null;
  appointments: {
    id: string;
    bookingCode: string;
    status: string;
    startTime: Date;
    totalPrice: number;
    services: { name: string }[];
    staffName: string | null;
  }[];
};

export type CreateClientInput = {
  businessId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  gender?: string | null;
  notes?: string | null;
  allergies?: string | null;
  preferences?: string | null;
  tags?: string[];
  source?: string | null;
};

export type UpdateClientInput = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  gender?: string | null;
  notes?: string | null;
  allergies?: string | null;
  preferences?: string | null;
  tags?: string[];
  isActive?: boolean;
};

export async function getClients(
  businessId: string,
  search?: string,
  page = 1,
  pageSize = 20
): Promise<{ clients: ClientListItem[]; total: number }> {
  const where = {
    businessId,
    isActive: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [raw, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        appointments: {
          include: {
            appointment: { select: { startTime: true } },
          },
          orderBy: { appointment: { startTime: "desc" } },
        },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    clients: raw.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      avatarUrl: c.avatarUrl,
      tags: c.tags,
      loyaltyPoints: c.loyaltyPoints,
      isActive: c.isActive,
      createdAt: c.createdAt,
      totalAppointments: c.appointments.length,
      lastVisit: c.appointments[0]?.appointment.startTime ?? null,
    })),
    total,
  };
}

export async function getClientById(
  businessId: string,
  clientId: string
): Promise<ClientDetail | null> {
  const c = await prisma.client.findFirst({
    where: { id: clientId, businessId },
    include: {
      appointments: {
        include: {
          appointment: {
            include: {
              services: { select: { serviceName: true } },
              staff: { select: { name: true } },
            },
          },
        },
        orderBy: { appointment: { startTime: "desc" } },
        take: 20,
      },
    },
  });
  if (!c) return null;

  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    avatarUrl: c.avatarUrl,
    tags: c.tags,
    loyaltyPoints: c.loyaltyPoints,
    isActive: c.isActive,
    createdAt: c.createdAt,
    birthdate: c.birthdate,
    gender: c.gender,
    notes: c.notes,
    allergies: c.allergies,
    preferences: c.preferences,
    referredBy: c.referredBy,
    source: c.source,
    totalAppointments: c.appointments.length,
    lastVisit: c.appointments[0]?.appointment.startTime ?? null,
    appointments: c.appointments.map((ac) => ({
      id: ac.appointment.id,
      bookingCode: ac.appointment.bookingCode,
      status: ac.appointment.status,
      startTime: ac.appointment.startTime,
      totalPrice: ac.appointment.totalPrice,
      services: ac.appointment.services.map((s) => ({ name: s.serviceName })),
      staffName: ac.appointment.staff?.name ?? null,
    })),
  };
}

export async function createClient(input: CreateClientInput): Promise<ClientListItem> {
  const { businessId, birthdate, ...rest } = input;
  const c = await prisma.client.create({
    data: {
      businessId,
      ...rest,
      birthdate: birthdate ? new Date(birthdate) : null,
      tags: rest.tags ?? [],
    },
  });
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    avatarUrl: c.avatarUrl,
    tags: c.tags,
    loyaltyPoints: c.loyaltyPoints,
    isActive: c.isActive,
    createdAt: c.createdAt,
    totalAppointments: 0,
    lastVisit: null,
  };
}

export async function updateClient(
  businessId: string,
  clientId: string,
  input: UpdateClientInput
): Promise<ClientListItem> {
  const { birthdate, ...rest } = input;

  const [c, apptCount, lastAppt] = await Promise.all([
    prisma.client.update({
      where: { id: clientId, businessId },
      data: {
        ...rest,
        birthdate: birthdate ? new Date(birthdate) : undefined,
      },
    }),
    prisma.appointmentClient.count({ where: { clientId } }),
    prisma.appointmentClient.findFirst({
      where: { clientId },
      include: { appointment: { select: { startTime: true } } },
      orderBy: { appointment: { startTime: "desc" } },
    }),
  ]);

  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    avatarUrl: c.avatarUrl,
    tags: c.tags,
    loyaltyPoints: c.loyaltyPoints,
    isActive: c.isActive,
    createdAt: c.createdAt,
    totalAppointments: apptCount,
    lastVisit: lastAppt?.appointment.startTime ?? null,
  };
}
