import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { listMemberships, createMembership } from "@/lib/services/membership.service";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]).optional(),
  sessionsPerCycle: z.number().int().min(0).optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional(),
  color: z.string().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const memberships = await listMemberships(businessId);
  return NextResponse.json(memberships);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const membership = await createMembership(businessId, parsed.data);
  return NextResponse.json(membership, { status: 201 });
}
