import { prisma } from "@/lib/db/client";

export type LoyaltyConfig = {
  enabled:          boolean;
  pointsPerBooking: number;
  pointsPerPurchase: number;
  pointValue:       number;
};

export async function getLoyaltyConfig(businessId: string): Promise<LoyaltyConfig> {
  const settings = await prisma.businessSettings.findUnique({
    where: { businessId },
    select: {
      loyaltyEnabled:          true,
      loyaltyPointsPerBooking: true,
      loyaltyPointsPerPurchase: true,
      loyaltyPointValue:       true,
    },
  });

  return {
    enabled:           settings?.loyaltyEnabled          ?? false,
    pointsPerBooking:  settings?.loyaltyPointsPerBooking ?? 10,
    pointsPerPurchase: settings?.loyaltyPointsPerPurchase ?? 1,
    pointValue:        settings?.loyaltyPointValue        ?? 100,
  };
}

export async function updateLoyaltyConfig(
  businessId: string,
  config: Partial<LoyaltyConfig>
) {
  return prisma.businessSettings.upsert({
    where: { businessId },
    create: {
      businessId,
      loyaltyEnabled:           config.enabled          ?? false,
      loyaltyPointsPerBooking:  config.pointsPerBooking ?? 10,
      loyaltyPointsPerPurchase: config.pointsPerPurchase ?? 1,
      loyaltyPointValue:        config.pointValue        ?? 100,
    },
    update: {
      loyaltyEnabled:           config.enabled,
      loyaltyPointsPerBooking:  config.pointsPerBooking,
      loyaltyPointsPerPurchase: config.pointsPerPurchase,
      loyaltyPointValue:        config.pointValue,
    },
  });
}

export async function addLoyaltyPoints(
  clientId: string,
  businessId: string,
  points: number,
  reason: "booking" | "purchase"
) {
  const config = await getLoyaltyConfig(businessId);
  if (!config.enabled || points <= 0) return null;

  const actualPoints =
    reason === "booking"
      ? config.pointsPerBooking
      : Math.floor(points * config.pointsPerPurchase);

  return prisma.client.update({
    where: { id: clientId },
    data: { loyaltyPoints: { increment: actualPoints } },
  });
}

export type RedeemResult =
  | { ok: true; pointsUsed: number; discount: number; remaining: number }
  | { ok: false; error: string };

export async function redeemLoyaltyPoints(
  clientId: string,
  businessId: string,
  pointsToRedeem: number
): Promise<RedeemResult> {
  const config = await getLoyaltyConfig(businessId);
  if (!config.enabled) return { ok: false, error: "Programa de puntos no activo" };

  const client = await prisma.client.findFirst({
    where: { id: clientId, businessId },
    select: { loyaltyPoints: true },
  });
  if (!client) return { ok: false, error: "Cliente no encontrado" };
  if (client.loyaltyPoints < pointsToRedeem) {
    return { ok: false, error: "No tienes suficientes puntos" };
  }

  const discount = Math.floor(pointsToRedeem / config.pointValue);
  if (discount <= 0) return { ok: false, error: "No alcanza el mínimo de puntos para canjear" };

  await prisma.client.update({
    where: { id: clientId },
    data: { loyaltyPoints: { decrement: pointsToRedeem } },
  });

  return {
    ok: true,
    pointsUsed: pointsToRedeem,
    discount,
    remaining: client.loyaltyPoints - pointsToRedeem,
  };
}
