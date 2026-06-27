import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getRevenueByDay, getTopServices, getTopStaff } from "@/lib/services/analytics.service";
import { redis } from "@/lib/cache/redis";

const TTL = 600;

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const now  = new Date();
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = searchParams.get("to")   ? new Date(searchParams.get("to")!)   : now;

  const fromKey = from.toISOString().slice(0, 10);
  const toKey   = to.toISOString().slice(0, 10);
  const cacheKey = `analytics:revenue:${businessId}:${fromKey}:${toKey}`;

  type RevenueCache = {
    daily: { date: string; revenue: number }[];
    services: { name: string; count: number; revenue: number }[];
    staff: { name: string; color: string; count: number; revenue: number }[];
  };

  const cached = await redis.get<RevenueCache>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const [daily, services, staff] = await Promise.all([
    getRevenueByDay(businessId, from, to),
    getTopServices(businessId, from, to),
    getTopStaff(businessId, from, to),
  ]);

  const payload = { daily, services, staff };
  await redis.set(cacheKey, payload, { ex: TTL });
  return NextResponse.json(payload);
}
