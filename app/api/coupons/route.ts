import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getCoupons, createCoupon, CouponSchema } from "@/lib/services/coupon.service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const coupons = await getCoupons(businessId);
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = CouponSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  try {
    const coupon = await createCoupon(businessId, parsed.data);
    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al crear cupón";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
