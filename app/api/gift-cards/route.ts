import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getGiftCards, createGiftCard, GiftCardSchema } from "@/lib/services/gift-card.service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const cards = await getGiftCards(businessId);
  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = GiftCardSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const card = await createGiftCard(businessId, parsed.data);
  return NextResponse.json(card, { status: 201 });
}
