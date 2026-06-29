import { prisma } from "@/lib/db/client";
import { cookies } from "next/headers";

export const SELECTED_BIZ_COOKIE = "frandora_biz";

export type UserBusiness = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export async function getBusinessId(clerkUserId: string): Promise<string | null> {
  const preferred = cookies().get(SELECTED_BIZ_COOKIE)?.value ?? null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: {
      ownedBusinesses: {
        select: { id: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) return null;
  const ids = user.ownedBusinesses.map((b) => b.id);
  if (ids.length === 0) return null;

  if (preferred && ids.includes(preferred)) return preferred;
  return ids[0];
}

export async function getUserBusinesses(clerkUserId: string): Promise<UserBusiness[]> {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: {
      ownedBusinesses: {
        select: { id: true, name: true, slug: true, logoUrl: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return user?.ownedBusinesses ?? [];
}
