import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getRevenueByDay, getTopServices, getTopStaff } from "@/lib/services/analytics.service";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const now  = new Date();
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = searchParams.get("to")   ? new Date(searchParams.get("to")!)   : now;

  const [daily, services, staff] = await Promise.all([
    getRevenueByDay(businessId, from, to),
    getTopServices(businessId, from, to),
    getTopStaff(businessId, from, to),
  ]);

  return NextResponse.json({ daily, services, staff });
}
