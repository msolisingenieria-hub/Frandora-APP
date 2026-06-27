import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getMembershipMRR, listMemberships, listSubscribers } from "@/lib/services/membership.service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const [mrr, memberships, subscribers] = await Promise.all([
    getMembershipMRR(businessId),
    listMemberships(businessId),
    listSubscribers(businessId),
  ]);

  const active = subscribers.filter((s) => s.status === "ACTIVE").length;
  const paused = subscribers.filter((s) => s.status === "PAUSED").length;
  const expired = subscribers.filter((s) => s.status === "EXPIRED").length;

  return NextResponse.json({
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    activeSubscribers: active,
    pausedSubscribers: paused,
    expiredSubscribers: expired,
    totalPlans: memberships.length,
    activePlans: memberships.filter((m) => m.isActive).length,
  });
}
