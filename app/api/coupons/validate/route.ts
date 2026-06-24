import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/lib/services/coupon.service";

const Schema = z.object({
  businessId: z.string(),
  code:       z.string(),
  amount:     z.number().positive(),
});

// Endpoint público — lo llama el flujo de reserva antes de confirmar
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const result = await validateCoupon(
    parsed.data.businessId,
    parsed.data.code,
    parsed.data.amount
  );

  return NextResponse.json(result);
}
