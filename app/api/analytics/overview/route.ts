import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getOverviewStats } from "@/lib/services/analytics.service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  const stats = await getOverviewStats(businessId);
  return NextResponse.json(stats);
}
