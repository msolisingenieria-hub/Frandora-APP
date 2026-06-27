import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getOverviewStats } from "@/lib/services/analytics.service";
import { redis } from "@/lib/cache/redis";

const TTL = 600;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const cacheKey = `analytics:overview:${businessId}`;
  const cached = await redis.get<Record<string, number>>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const stats = await getOverviewStats(businessId);
  await redis.set(cacheKey, stats, { ex: TTL });
  return NextResponse.json(stats);
}
