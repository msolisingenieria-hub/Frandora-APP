import { prisma } from "@/lib/db/client";

export async function getBusinessId(clerkUserId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { ownedBusinesses: { select: { id: true }, take: 1 } },
  });
  return user?.ownedBusinesses[0]?.id ?? null;
}
