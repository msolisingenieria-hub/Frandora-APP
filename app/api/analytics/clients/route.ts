import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getClientStats, getHourlyHeatmap } from "@/lib/services/analytics.service";
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

  const fromKey  = from.toISOString().slice(0, 10);
  const toKey    = to.toISOString().slice(0, 10);
  const cacheKey = `analytics:clients:${businessId}:${fromKey}:${toKey}`;

  type ClientsCache = {
    clients: { newCount: number; returningCount: number; atRisk: number };
    heatmap: number[][];
  };

  const cached = await redis.get<ClientsCache>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const [clients, heatmap] = await Promise.all([
    getClientStats(businessId, from, to),
    getHourlyHeatmap(businessId, from, to),
  ]);

  const payload = { clients, heatmap };
  await redis.set(cacheKey, payload, { ex: TTL });
  return NextResponse.json(payload);
}
