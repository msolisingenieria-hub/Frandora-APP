import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getMembership, updateMembership, deleteMembership } from "@/lib/services/membership.service";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]).optional(),
  sessionsPerCycle: z.number().int().min(0).optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const membership = await getMembership(businessId, id);
  if (!membership) return NextResponse.json({ error: "Membresía no encontrada" }, { status: 404 });

  return NextResponse.json(membership);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const membership = await updateMembership(businessId, id, parsed.data);
  if (!membership) return NextResponse.json({ error: "Membresía no encontrada" }, { status: 404 });

  return NextResponse.json(membership);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const ok = await deleteMembership(businessId, id);
  if (!ok) return NextResponse.json({ error: "Membresía no encontrada" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
