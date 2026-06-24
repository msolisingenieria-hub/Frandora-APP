import { prisma } from "@/lib/db/client";
import { z } from "zod";

export const CouponSchema = z.object({
  code:        z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  type:        z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
  value:       z.number().positive(),
  minAmount:   z.number().positive().optional(),
  maxUses:     z.number().int().positive().optional(),
  expiresAt:   z.string().datetime().optional(),
});

export type CouponInput = z.infer<typeof CouponSchema>;

export async function getCoupons(businessId: string) {
  return prisma.coupon.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoupon(businessId: string, input: CouponInput) {
  const existing = await prisma.coupon.findUnique({
    where: { businessId_code: { businessId, code: input.code } },
  });
  if (existing) throw new Error("Ya existe un cupón con ese código");

  return prisma.coupon.create({
    data: {
      businessId,
      code:        input.code,
      description: input.description,
      type:        input.type,
      value:       input.value,
      minAmount:   input.minAmount,
      maxUses:     input.maxUses,
      expiresAt:   input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
  });
}

export async function updateCoupon(
  id: string,
  businessId: string,
  data: Partial<CouponInput> & { isActive?: boolean }
) {
  return prisma.coupon.updateMany({
    where: { id, businessId },
    data: {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    },
  });
}

export async function deleteCoupon(id: string, businessId: string) {
  return prisma.coupon.deleteMany({ where: { id, businessId } });
}

export type ValidateResult =
  | { valid: true; discount: number; type: string; couponId: string }
  | { valid: false; error: string };

export async function validateCoupon(
  businessId: string,
  code: string,
  amount: number
): Promise<ValidateResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { businessId_code: { businessId, code: code.toUpperCase() } },
  });

  if (!coupon || !coupon.isActive) {
    return { valid: false, error: "Cupón no válido o inactivo" };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "El cupón ya venció" };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "El cupón alcanzó su límite de usos" };
  }
  if (coupon.minAmount && amount < coupon.minAmount) {
    return {
      valid: false,
      error: `El monto mínimo para usar este cupón es $${coupon.minAmount}`,
    };
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.min(amount * (coupon.value / 100), amount)
      : Math.min(coupon.value, amount);

  return { valid: true, discount, type: coupon.type, couponId: coupon.id };
}

export async function redeemCoupon(couponId: string) {
  return prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}
