import { prisma } from "@/lib/db/client";
import { z } from "zod";
import { randomBytes } from "crypto";

export const GiftCardSchema = z.object({
  initialValue:   z.number().positive(),
  purchaserName:  z.string().optional(),
  purchaserEmail: z.string().email().optional(),
  message:        z.string().max(300).optional(),
  recipientEmail: z.string().email().optional(),
  expiresAt:      z.string().datetime().optional(),
});

export type GiftCardInput = z.infer<typeof GiftCardSchema>;

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function getGiftCards(businessId: string) {
  return prisma.giftCard.findMany({
    where: { businessId },
    include: { recipient: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGiftCard(businessId: string, input: GiftCardInput) {
  let code: string;
  let tries = 0;

  do {
    code = `GC-${generateCode()}`;
    const exists = await prisma.giftCard.findUnique({ where: { code } });
    if (!exists) break;
    tries++;
  } while (tries < 5);

  let recipientId: string | undefined;
  if (input.recipientEmail) {
    const client = await prisma.client.findFirst({
      where: { businessId, email: input.recipientEmail },
    });
    if (client) recipientId = client.id;
  }

  return prisma.giftCard.create({
    data: {
      businessId,
      code: code!,
      initialValue:   input.initialValue,
      currentValue:   input.initialValue,
      purchaserName:  input.purchaserName,
      purchaserEmail: input.purchaserEmail,
      message:        input.message,
      recipientId,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
  });
}

export type GiftCardCheckResult =
  | { valid: true; code: string; balance: number; status: string }
  | { valid: false; error: string };

export async function checkGiftCard(
  businessId: string,
  code: string
): Promise<GiftCardCheckResult> {
  const gc = await prisma.giftCard.findFirst({
    where: { businessId, code: code.toUpperCase() },
  });

  if (!gc) return { valid: false, error: "Tarjeta de regalo no encontrada" };
  if (gc.status !== "ACTIVE") return { valid: false, error: "Tarjeta inactiva o ya usada" };
  if (gc.expiresAt && gc.expiresAt < new Date()) return { valid: false, error: "Tarjeta vencida" };
  if (gc.currentValue <= 0) return { valid: false, error: "Tarjeta sin saldo" };

  return { valid: true, code: gc.code, balance: gc.currentValue, status: gc.status };
}

export async function redeemGiftCard(
  businessId: string,
  code: string,
  amount: number
): Promise<{ applied: number; remaining: number }> {
  const gc = await prisma.giftCard.findFirst({
    where: { businessId, code: code.toUpperCase(), status: "ACTIVE" },
  });
  if (!gc) throw new Error("Tarjeta no válida");

  const applied = Math.min(amount, gc.currentValue);
  const remaining = gc.currentValue - applied;

  await prisma.giftCard.update({
    where: { id: gc.id },
    data: {
      currentValue: remaining,
      status: remaining <= 0 ? "USED" : "ACTIVE",
    },
  });

  return { applied, remaining };
}
