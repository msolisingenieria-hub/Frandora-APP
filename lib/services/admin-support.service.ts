import { prisma } from "@/lib/db/client";
import { audit } from "@/lib/audit/log";
import { z } from "zod";

export const ticketSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const ticketUpdateSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedTo: z.string().optional().nullable(),
});

export const messageSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().default(false),
});

export async function listTickets(status?: string) {
  return prisma.supportTicket.findMany({
    where: status ? { status: status as "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED" } : undefined,
    include: {
      business: { select: { name: true, slug: true } },
      _count: { select: { messages: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
}

export async function getTicket(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: {
      business: { select: { name: true, slug: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function createTicket(businessId: string, data: z.infer<typeof ticketSchema>) {
  return prisma.supportTicket.create({
    data: { ...data, businessId },
  });
}

export async function updateTicket(id: string, data: z.infer<typeof ticketUpdateSchema>, adminId: string) {
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...data,
      resolvedAt: data.status === "RESOLVED" ? new Date() : undefined,
    },
  });
  await audit({ userId: adminId, action: "ADMIN_UPDATE_TICKET", resource: "support_ticket", resourceId: id, metadata: data });
  return ticket;
}

export async function addTicketMessage(ticketId: string, content: string, authorId: string, authorName: string, isInternal: boolean) {
  return prisma.ticketMessage.create({
    data: { ticketId, content, authorId, authorName, isInternal },
  });
}

export async function getTicketStats() {
  const [open, inReview, resolved] = await Promise.all([
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.supportTicket.count({ where: { status: "IN_REVIEW" } }),
    prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
  ]);
  return { open, inReview, resolved };
}
