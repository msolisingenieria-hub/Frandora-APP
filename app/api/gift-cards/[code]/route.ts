import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { checkGiftCard, redeemGiftCard } from "@/lib/services/gift-card.service";
import { z } from "zod";

// GET /api/gift-cards/[code] — verificar saldo (puede ser llamado sin auth desde POS)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { code } = await params;
  const result = await checkGiftCard(businessId, code);
  return NextResponse.json(result);
}

// PATCH /api/gift-cards/[code] — canjear (reducir saldo)
const RedeemSchema = z.object({ amount: z.number().positive() });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { code } = await params;
  const body = await req.json();
  const parsed = RedeemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  try {
    const result = await redeemGiftCard(businessId, code, parsed.data.amount);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al canjear";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
