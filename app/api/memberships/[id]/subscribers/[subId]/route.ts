import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { updateClientMembershipStatus } from "@/lib/services/membership.service";

const updateSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED", "EXPIRED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { subId } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const subscription = await updateClientMembershipStatus(businessId, subId, parsed.data.status);
  if (!subscription) return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });

  return NextResponse.json(subscription);
}
