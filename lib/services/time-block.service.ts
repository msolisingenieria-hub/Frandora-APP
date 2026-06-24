import { prisma } from "@/lib/db/client";
import { z } from "zod";

export const TimeBlockSchema = z.object({
  title:     z.string().min(1).max(100),
  startTime: z.string().datetime(),
  endTime:   z.string().datetime(),
  color:     z.string().default("#94a3b8"),
  reason:    z.string().max(200).optional(),
  staffId:   z.string().optional(),
});

export type TimeBlockInput = z.infer<typeof TimeBlockSchema>;

export async function getTimeBlocks(businessId: string, from: Date, to: Date) {
  return prisma.timeBlock.findMany({
    where: {
      businessId,
      startTime: { gte: from },
      endTime:   { lte: to },
    },
    include: {
      staff: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function createTimeBlock(businessId: string, data: TimeBlockInput) {
  return prisma.timeBlock.create({
    data: {
      businessId,
      title:     data.title,
      startTime: new Date(data.startTime),
      endTime:   new Date(data.endTime),
      color:     data.color,
      reason:    data.reason,
      staffId:   data.staffId,
    },
  });
}

export async function deleteTimeBlock(id: string) {
  return prisma.timeBlock.delete({ where: { id } });
}
