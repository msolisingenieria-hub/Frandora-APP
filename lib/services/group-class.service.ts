import { prisma } from "@/lib/db/client";
import { z } from "zod";

export const GroupClassSchema = z.object({
  name:           z.string().min(1).max(100),
  description:    z.string().max(500).optional(),
  color:          z.string().default("#6FA89E"),
  maxCapacity:    z.number().int().min(1),
  price:          z.number().min(0).default(0),
  requiresDeposit: z.boolean().default(false),
  depositAmount:  z.number().min(0).optional(),
  startTime:      z.string().datetime(),
  endTime:        z.string().datetime(),
  staffId:        z.string().optional(),
  serviceId:      z.string().optional(),
  isPublic:       z.boolean().default(true),
});

export type GroupClassInput = z.infer<typeof GroupClassSchema>;

export async function getGroupClasses(businessId: string, from?: Date, to?: Date) {
  return prisma.groupClass.findMany({
    where: {
      businessId,
      isActive: true,
      ...(from && to ? { startTime: { gte: from, lte: to } } : {}),
    },
    include: {
      staff:       { select: { id: true, name: true, color: true } },
      service:     { select: { id: true, name: true } },
      _count:      { select: { enrollments: { where: { status: { not: "CANCELED" } } } } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getGroupClassById(id: string) {
  return prisma.groupClass.findUnique({
    where: { id },
    include: {
      staff:   { select: { id: true, name: true, color: true } },
      service: { select: { id: true, name: true } },
      enrollments: {
        where:   { status: { not: "CANCELED" } },
        orderBy: { createdAt: "asc" },
        include: { client: { select: { id: true, name: true, phone: true } } },
      },
    },
  });
}

export async function createGroupClass(businessId: string, data: GroupClassInput) {
  return prisma.groupClass.create({
    data: {
      businessId,
      name:            data.name,
      description:     data.description,
      color:           data.color,
      maxCapacity:     data.maxCapacity,
      price:           data.price,
      requiresDeposit: data.requiresDeposit,
      depositAmount:   data.depositAmount,
      startTime:       new Date(data.startTime),
      endTime:         new Date(data.endTime),
      staffId:         data.staffId,
      serviceId:       data.serviceId,
      isPublic:        data.isPublic,
    },
  });
}

export async function updateGroupClass(id: string, data: Partial<GroupClassInput>) {
  return prisma.groupClass.update({
    where: { id },
    data: {
      ...data,
      ...(data.startTime ? { startTime: new Date(data.startTime) } : {}),
      ...(data.endTime   ? { endTime:   new Date(data.endTime)   } : {}),
    },
  });
}

export async function deleteGroupClass(id: string) {
  await prisma.groupClass.update({ where: { id }, data: { isActive: false } });
}

// ── Inscripciones ──────────────────────────────────────────────────────────

export const EnrollSchema = z.object({
  clientName:  z.string().min(1),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  clientId:    z.string().optional(),
});

export type EnrollInput = z.infer<typeof EnrollSchema>;

export async function enrollInClass(classId: string, data: EnrollInput) {
  const groupClass = await prisma.groupClass.findUnique({
    where: { id: classId },
    include: { _count: { select: { enrollments: { where: { status: { not: "CANCELED" } } } } } },
  });
  if (!groupClass) throw new Error("Clase no encontrada");

  const enrolled = groupClass._count.enrollments;
  const status   = enrolled >= groupClass.maxCapacity ? "WAITLISTED" : "ENROLLED";

  return prisma.classEnrollment.create({
    data: {
      classId,
      clientId:    data.clientId,
      clientName:  data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      status,
    },
  });
}

export async function checkInEnrollment(enrollmentId: string) {
  return prisma.classEnrollment.update({
    where: { id: enrollmentId },
    data:  { status: "ATTENDED", checkedInAt: new Date() },
  });
}

export async function cancelEnrollment(enrollmentId: string) {
  return prisma.classEnrollment.update({
    where: { id: enrollmentId },
    data:  { status: "CANCELED" },
  });
}
