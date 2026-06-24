import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getWaitlist, addToWaitlist, WaitlistSchema } from "@/lib/services/waitlist.service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const list = await getWaitlist(businessId);
  return NextResponse.json(list);
}

// POST puede ser llamado desde el panel o desde la página pública
export async function POST(req: NextRequest) {
  const body   = await req.json();
  const parsed = WaitlistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Si viene del panel, usamos auth; si viene del público, body debe traer businessId
  let businessId: string | null = null;

  const { userId } = await auth();
  if (userId) {
    businessId = await getBusinessId(userId);
  } else if (body.businessId) {
    businessId = body.businessId;
  }

  if (!businessId) return NextResponse.json({ error: "Negocio no identificado" }, { status: 400 });

  const entry = await addToWaitlist(businessId, parsed.data);
  return NextResponse.json(entry, { status: 201 });
}
