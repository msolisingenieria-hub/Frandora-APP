import { prisma } from "@/lib/db/client";
import { audit } from "@/lib/audit/log";
import type { PlanTier } from "@prisma/client";
import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(10),
  type: z.enum(["BANNER", "CHANGELOG", "MAINTENANCE", "PROMOTION"]).default("BANNER"),
  isActive: z.boolean().default(true),
  targetPlans: z.array(z.enum(["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE", "ENTERPRISE"])).default([]),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaUrl: z.string().url().optional().nullable(),
});

export const broadcastSchema = z.object({
  subject: z.string().min(3).max(200),
  content: z.string().min(10),
  targetPlans: z.array(z.enum(["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE", "ENTERPRISE"])).default([]),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export async function listAnnouncements() {
  return prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createAnnouncement(data: z.infer<typeof announcementSchema>, adminId: string) {
  const announcement = await prisma.announcement.create({
    data: {
      ...data,
      targetPlans: data.targetPlans as PlanTier[],
      authorId: adminId,
    },
  });
  await audit({ userId: adminId, action: "ADMIN_CREATE_ANNOUNCEMENT", resource: "announcement", resourceId: announcement.id });
  return announcement;
}

export async function updateAnnouncement(id: string, data: Partial<z.infer<typeof announcementSchema>>) {
  return prisma.announcement.update({
    where: { id },
    data: { ...data, targetPlans: data.targetPlans ? (data.targetPlans as PlanTier[]) : undefined },
  });
}

export async function deleteAnnouncement(id: string, adminId: string) {
  await prisma.announcement.delete({ where: { id } });
  await audit({ userId: adminId, action: "ADMIN_DELETE_ANNOUNCEMENT", resource: "announcement", resourceId: id });
}

export async function listBroadcasts() {
  return prisma.broadcastEmail.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createBroadcast(data: z.infer<typeof broadcastSchema>, adminId: string) {
  const broadcast = await prisma.broadcastEmail.create({
    data: {
      ...data,
      targetPlans: data.targetPlans as PlanTier[],
      authorId: adminId,
      status: data.scheduledAt ? "SCHEDULED" : "DRAFT",
    },
  });
  await audit({ userId: adminId, action: "ADMIN_CREATE_BROADCAST", resource: "broadcast_email", resourceId: broadcast.id });
  return broadcast;
}

// Anuncios activos para el dashboard de los negocios (se consume desde el panel)
export async function getActiveAnnouncementsForPlan(plan: PlanTier) {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [
        { targetPlans: { isEmpty: true } }, // para todos
        { targetPlans: { has: plan } },
      ],
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}
