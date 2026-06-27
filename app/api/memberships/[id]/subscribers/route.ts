import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { listSubscribers, assignMembership } from "@/lib/services/membership.service";

const assignSchema = z.object({
  clientId: z.string().min(1),
  startDate: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id: membershipId } = await params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED" | undefined;

  const all = await listSubscribers(businessId, status);
  const filtered = all.filter((s) => s.membershipId === membershipId);
  return NextResponse.json(filtered);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id: membershipId } = await params;
  const body = await req.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const subscription = await assignMembership(businessId, { ...parsed.data, membershipId });
    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al asignar membresía";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
