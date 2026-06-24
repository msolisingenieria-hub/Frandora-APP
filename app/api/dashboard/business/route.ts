import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      ownedBusinesses: {
        include: {
          subscription: {
            include: { plan: { select: { name: true } } },
          },
        },
        take: 1,
      },
    },
  });

  if (!user || user.ownedBusinesses.length === 0) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const b = user.ownedBusinesses[0];
  return NextResponse.json({
    id: b.id,
    name: b.name,
    slug: b.slug,
    subscription: b.subscription
      ? {
          status: b.subscription.status,
          trialEndsAt: b.subscription.trialEndsAt?.toISOString() ?? null,
          plan: b.subscription.plan ? { name: b.subscription.plan.name } : null,
        }
      : null,
  });
}
