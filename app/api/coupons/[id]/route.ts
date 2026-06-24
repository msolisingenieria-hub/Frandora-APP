import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { updateCoupon, deleteCoupon } from "@/lib/services/coupon.service";
import { z } from "zod";

const PatchSchema = z.object({
  isActive:    z.boolean().optional(),
  description: z.string().optional(),
  maxUses:     z.number().int().positive().optional(),
  expiresAt:   z.string().datetime().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  await updateCoupon(id, businessId, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  await deleteCoupon(id, businessId);
  return NextResponse.json({ ok: true });
}
