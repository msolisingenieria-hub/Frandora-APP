"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { SELECTED_BIZ_COOKIE } from "@/lib/auth/business";

export async function switchBusinessAction(businessId: string) {
  const { userId } = await auth();
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { ownedBusinesses: { select: { id: true } } },
  });

  const isOwner = user?.ownedBusinesses.some((b) => b.id === businessId);
  if (!isOwner) return;

  cookies().set(SELECTED_BIZ_COOKIE, businessId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
  });

  redirect("/dashboard");
}
