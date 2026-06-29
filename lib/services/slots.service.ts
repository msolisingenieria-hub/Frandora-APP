import { prisma } from "@/lib/db/client";
import {
  addMinutes, startOfDay, endOfDay,
  format, getDay, isBefore, isAfter,
} from "date-fns";

export type SlotInput = {
  businessId: string;
  serviceId: string;
  staffId?: string | null;
  date: Date;
};

export type SlotResult = {
  time: string;  // ISO string
  label: string; // "09:00"
};

// Parsea "HH:MM" → minutos desde medianoche
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Genera un DateTime combinando una fecha base + minutos desde medianoche
function minutesToDate(base: Date, minutes: number): Date {
  const d = startOfDay(base);
  return addMinutes(d, minutes);
}

// Detecta si [slotStart, slotStart+duration] se solapa con [apptStart, apptEnd]
function overlaps(
  slotStart: Date,
  duration: number,
  apptStart: Date,
  apptEnd: Date
): boolean {
  const slotEnd = addMinutes(slotStart, duration);
  return isBefore(slotStart, apptEnd) && isAfter(slotEnd, apptStart);
}

export async function getAvailableSlots({
  businessId,
  serviceId,
  staffId,
  date,
}: SlotInput): Promise<SlotResult[]> {
  const dayOfWeek = getDay(date); // 0=Dom, 6=Sáb

  // 1. Obtener servicio para saber la duración
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true, isOnline: true },
    select: { duration: true },
  });
  if (!service) return [];
  const duration = service.duration;

  if (staffId) {
    const staff = await prisma.staffMember.findFirst({
      where: {
        id: staffId,
        businessId,
        isActive: true,
        services: { some: { serviceId } },
      },
      select: { id: true },
    });
    if (!staff) return [];
  }

  // 2. Obtener horario de la ubicación para ese día
  const location = await prisma.businessLocation.findFirst({
    where: { businessId, isMain: true },
    include: {
      schedules: { where: { dayOfWeek } },
    },
  });
  if (!location) return [];
  const schedule = location.schedules[0];
  if (!schedule || schedule.isClosed) return [];

  const openMinutes  = timeToMinutes(schedule.openTime);
  const closeMinutes = timeToMinutes(schedule.closeTime);

  // 3. Obtener citas existentes ese día
  const dayStart = startOfDay(date);
  const dayEnd   = endOfDay(date);

  const existingAppts = await prisma.appointment.findMany({
    where: {
      businessId,
      ...(staffId ? { staffId } : {}),
      status: { notIn: ["CANCELED", "NO_SHOW"] },
      startTime: { gte: dayStart, lte: dayEnd },
    },
    select: { startTime: true, endTime: true },
  });

  // 4. Generar slots cada 30 min dentro del horario
  const INTERVAL = 30;
  const slots: SlotResult[] = [];

  for (let min = openMinutes; min + duration <= closeMinutes; min += INTERVAL) {
    const slotStart = minutesToDate(date, min);

    // Verificar que no se solape con ninguna cita existente
    const blocked = existingAppts.some((a) =>
      overlaps(slotStart, duration, a.startTime, a.endTime)
    );

    // No mostrar slots en el pasado
    const inPast = isBefore(slotStart, new Date());

    if (!blocked && !inPast) {
      slots.push({
        time: slotStart.toISOString(),
        label: format(slotStart, "HH:mm"),
      });
    }
  }

  return slots;
}

// Obtiene datos públicos del negocio para la página de reservas
export async function getPublicBusinessData(slug: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      locations: {
        where: { isMain: true },
        include: { schedules: { orderBy: { dayOfWeek: "asc" } } },
        take: 1,
      },
      services: {
        where: { isActive: true, isOnline: true },
        include: { category: true },
        orderBy: { order: "asc" },
      },
      staff: {
        where: { isActive: true },
        include: {
          services: { select: { serviceId: true } },
        },
      },
      customization: true,
      settings: true,
    },
  });

  if (!business) return null;

  const location = business.locations[0];

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    logoUrl: business.logoUrl ?? null,
    coverUrl: business.bannerUrl ?? null,
    city: location?.city ?? null,
    phone: business.phone,
    currency: business.settings?.currency ?? "CLP",
    timezone: business.settings?.timezone ?? "America/Santiago",
    services: business.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      color: s.color,
      imageUrl: s.imageUrl ?? null,
      categoryName: s.category?.name ?? null,
    })),
    staff: business.staff.map((m) => ({
      id: m.id,
      name: m.name,
      avatarUrl: m.avatarUrl,
      bio: m.bio,
      specialties: m.specialties,
      serviceIds: m.services.map((ss) => ss.serviceId),
    })),
    schedule: location?.schedules.map((sc) => ({
      dayOfWeek: sc.dayOfWeek,
      openTime: sc.openTime,
      closeTime: sc.closeTime,
      isClosed: sc.isClosed,
    })) ?? [],
  };
}
