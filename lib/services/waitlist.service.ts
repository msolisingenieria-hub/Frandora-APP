import { prisma } from "@/lib/db/client";
import { z } from "zod";

export const WaitlistSchema = z.object({
  clientName:    z.string().min(1),
  clientEmail:   z.string().email().optional(),
  clientPhone:   z.string().optional(),
  serviceId:     z.string().optional(),
  staffId:       z.string().optional(),
  preferredDate: z.string().datetime().optional(),
  notes:         z.string().max(300).optional(),
});

export type WaitlistInput = z.infer<typeof WaitlistSchema>;

export async function getWaitlist(businessId: string) {
  return prisma.waitlist.findMany({
    where:   { businessId, status: { in: ["WAITING", "NOTIFIED"] } },
    orderBy: { createdAt: "asc" },
  });
}

export async function addToWaitlist(businessId: string, data: WaitlistInput) {
  return prisma.waitlist.create({
    data: {
      businessId,
      clientName:    data.clientName,
      clientEmail:   data.clientEmail,
      clientPhone:   data.clientPhone,
      serviceId:     data.serviceId,
      staffId:       data.staffId,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
      notes:         data.notes,
    },
  });
}

export async function notifyWaitlistEntry(id: string) {
  return prisma.waitlist.update({
    where: { id },
    data:  { status: "NOTIFIED", notifiedAt: new Date() },
  });
}

export async function confirmWaitlistEntry(id: string) {
  return prisma.waitlist.update({
    where: { id },
    data:  { status: "CONFIRMED" },
  });
}

export async function removeFromWaitlist(id: string) {
  return prisma.waitlist.update({
    where: { id },
    data:  { status: "EXPIRED" },
  });
}

export async function getWaitlistCount(businessId: string) {
  return prisma.waitlist.count({
    where: { businessId, status: { in: ["WAITING", "NOTIFIED"] } },
  });
}
