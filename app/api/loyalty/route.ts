import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getLoyaltyConfig, updateLoyaltyConfig } from "@/lib/services/loyalty.service";
import { z } from "zod";

const Schema = z.object({
  enabled:           z.boolean().optional(),
  pointsPerBooking:  z.number().int().min(1).max(1000).optional(),
  pointsPerPurchase: z.number().min(0).max(100).optional(),
  pointValue:        z.number().int().min(1).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const config = await getLoyaltyConfig(businessId);
  return NextResponse.json(config);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  await updateLoyaltyConfig(businessId, parsed.data);
  return NextResponse.json({ ok: true });
}
