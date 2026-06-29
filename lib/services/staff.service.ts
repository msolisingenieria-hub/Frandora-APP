import { prisma } from "@/lib/db/client";
import { z } from "zod";

export const StaffSchema = z.object({
  name:           z.string().min(1),
  email:          z.string().email().optional().or(z.literal("")),
  phone:          z.string().optional(),
  bio:            z.string().optional(),
  role:           z.enum(["BUSINESS_OWNER","MANAGER","STAFF","RECEPTIONIST"]).default("STAFF"),
  color:          z.string().default("#6d28d9"),
  commissionRate: z.number().min(0).max(100).default(0),
  commissionType: z.enum(["PERCENT","FIXED"]).default("PERCENT"),
  isActive:       z.boolean().default(true),
  acceptsBookings: z.boolean().optional(),
  avatarUrl:      z.string().url().optional().or(z.literal("")),
});

export type StaffInput = z.infer<typeof StaffSchema>;

export const ScheduleSchema = z.object({
  dayOfWeek:   z.number().int().min(0).max(6),
  startTime:   z.string().regex(/^\d{2}:\d{2}$/),
  endTime:     z.string().regex(/^\d{2}:\d{2}$/),
  isAvailable: z.boolean().default(true),
});

export const TimeOffSchema = z.object({
  startDate: z.string(),
  endDate:   z.string(),
  reason:    z.string().optional(),
});

export async function getStaffList(businessId: string) {
  return prisma.staffMember.findMany({
    where:   { businessId },
    orderBy: { name: "asc" },
    include: {
      schedules: { orderBy: { dayOfWeek: "asc" } },
      timeOff:   { where: { endDate: { gte: new Date() } } },
      services:  { include: { service: { select: { id: true, name: true } } } },
      _count:    { select: { appointments: true } },
    },
  });
}

export async function getStaffById(businessId: string, id: string) {
  return prisma.staffMember.findFirst({
    where: { id, businessId },
    include: {
      schedules: { orderBy: { dayOfWeek: "asc" } },
      timeOff:   { orderBy: { startDate: "asc" } },
      services:  { include: { service: true } },
      _count:    { select: { appointments: true } },
    },
  });
}

export async function createStaff(businessId: string, data: StaffInput) {
  // Por defecto recepcionista y dueño NO aparecen en la agenda (no atienden clientes)
  const defaultAccepts = data.role === "RECEPTIONIST" || data.role === "BUSINESS_OWNER" ? false : true;
  return prisma.staffMember.create({
    data: {
      businessId,
      name:           data.name,
      email:          data.email || null,
      phone:          data.phone || null,
      bio:            data.bio || null,
      role:           data.role as never,
      color:          data.color,
      commissionRate: data.commissionRate,
      commissionType: data.commissionType,
      isActive:       data.isActive,
      acceptsBookings: data.acceptsBookings ?? defaultAccepts,
      avatarUrl:      data.avatarUrl || null,
    },
  });
}

export async function updateStaff(businessId: string, id: string, data: Partial<StaffInput>) {
  const staff = await prisma.staffMember.findFirst({ where: { id, businessId } });
  if (!staff) return null;
  return prisma.staffMember.update({
    where: { id },
    data: {
      ...(data.name           !== undefined && { name: data.name }),
      ...(data.email          !== undefined && { email: data.email || null }),
      ...(data.phone          !== undefined && { phone: data.phone || null }),
      ...(data.bio            !== undefined && { bio: data.bio || null }),
      ...(data.role           !== undefined && { role: data.role as never }),
      ...(data.color          !== undefined && { color: data.color }),
      ...(data.commissionRate !== undefined && { commissionRate: data.commissionRate }),
      ...(data.commissionType !== undefined && { commissionType: data.commissionType }),
      ...(data.isActive       !== undefined && { isActive: data.isActive }),
      ...(data.acceptsBookings !== undefined && { acceptsBookings: data.acceptsBookings }),
      ...(data.avatarUrl      !== undefined && { avatarUrl: data.avatarUrl || null }),
    },
  });
}

export async function deleteStaff(businessId: string, id: string) {
  const staff = await prisma.staffMember.findFirst({ where: { id, businessId } });
  if (!staff) return null;
  return prisma.staffMember.update({ where: { id }, data: { isActive: false } });
}

export async function setStaffSchedules(staffId: string, businessId: string, schedules: z.infer<typeof ScheduleSchema>[]) {
  const staff = await prisma.staffMember.findFirst({ where: { id: staffId, businessId } });
  if (!staff) return null;
  await prisma.staffSchedule.deleteMany({ where: { staffId } });
  return prisma.staffSchedule.createMany({ data: schedules.map(s => ({ staffId, ...s })) });
}

export async function addTimeOff(staffId: string, businessId: string, data: z.infer<typeof TimeOffSchema>) {
  const staff = await prisma.staffMember.findFirst({ where: { id: staffId, businessId } });
  if (!staff) return null;
  return prisma.staffTimeOff.create({
    data: { staffId, startDate: new Date(data.startDate), endDate: new Date(data.endDate), reason: data.reason },
  });
}

export async function deleteTimeOff(staffId: string, businessId: string, timeOffId: string) {
  const staff = await prisma.staffMember.findFirst({ where: { id: staffId, businessId } });
  if (!staff) return null;
  return prisma.staffTimeOff.deleteMany({ where: { id: timeOffId, staffId } });
}

export async function setStaffServices(staffId: string, businessId: string, serviceIds: string[]) {
  const staff = await prisma.staffMember.findFirst({ where: { id: staffId, businessId } });
  if (!staff) return null;
  await prisma.staffService.deleteMany({ where: { staffId } });
  if (serviceIds.length === 0) return { count: 0 };
  return prisma.staffService.createMany({
    data: serviceIds.map(serviceId => ({ staffId, serviceId })),
    skipDuplicates: true,
  });
}

export async function getStaffCommissions(staffId: string, businessId: string, from: Date, to: Date) {
  const staff = await prisma.staffMember.findFirst({ where: { id: staffId, businessId } });
  if (!staff) return null;

  const appointments = await prisma.appointment.findMany({
    where: { staffId, businessId, startTime: { gte: from, lte: to }, status: { in: ["COMPLETED"] } },
    include: { services: { include: { service: { select: { name: true } } } } },
  });

  const totalRevenue = appointments.reduce((sum, a) => sum + a.totalPrice, 0);
  const commission = staff.commissionType === "PERCENT"
    ? totalRevenue * ((staff.commissionRate ?? 0) / 100)
    : (staff.commissionRate ?? 0) * appointments.length;

  return { staff, appointments, totalRevenue, commission };
}
