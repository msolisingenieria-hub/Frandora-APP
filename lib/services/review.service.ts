import { prisma } from "@/lib/db/client";
import { z } from "zod";

export const ReviewSchema = z.object({
  appointmentId: z.string().optional(),
  clientName:    z.string().min(2),
  clientEmail:   z.string().email().optional(),
  rating:        z.number().int().min(1).max(5),
  comment:       z.string().max(1000).optional(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;

export async function getReviews(businessId: string) {
  return prisma.review.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicReviews(businessId: string) {
  return prisma.review.findMany({
    where: { businessId, isPublic: true },
    select: {
      id: true, clientName: true, rating: true,
      comment: true, reply: true, repliedAt: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getReviewStats(businessId: string) {
  const reviews = await prisma.review.findMany({
    where: { businessId, isPublic: true },
    select: { rating: true },
  });

  if (reviews.length === 0) return { average: 0, total: 0, distribution: {} };

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    sum += r.rating;
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  }

  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    total: reviews.length,
    distribution,
  };
}

export async function createReview(businessId: string, input: ReviewInput) {
  if (input.appointmentId) {
    const exists = await prisma.review.findFirst({
      where: { appointmentId: input.appointmentId },
    });
    if (exists) throw new Error("Ya dejaste tu opinión para esta cita");

    const appt = await prisma.appointment.findFirst({
      where: { id: input.appointmentId, businessId },
    });
    if (!appt) throw new Error("Cita no encontrada");
  }

  return prisma.review.create({
    data: {
      businessId,
      appointmentId: input.appointmentId,
      clientName:    input.clientName,
      clientEmail:   input.clientEmail,
      rating:        input.rating,
      comment:       input.comment,
      isVerified:    !!input.appointmentId,
    },
  });
}

export async function replyToReview(id: string, businessId: string, reply: string) {
  return prisma.review.updateMany({
    where: { id, businessId },
    data: { reply, repliedAt: new Date() },
  });
}

export async function toggleReviewVisibility(id: string, businessId: string, isPublic: boolean) {
  return prisma.review.updateMany({
    where: { id, businessId },
    data: { isPublic },
  });
}

export async function getAppointmentForReview(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      business: { select: { name: true, slug: true } },
      services: { include: { service: { select: { name: true } } }, take: 1 },
      staff:    { select: { name: true } },
    },
  });
}
