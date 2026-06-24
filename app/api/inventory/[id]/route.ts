import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { updateProduct, adjustStock } from "@/lib/services/inventory.service";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  costPrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const adjustSchema = z.object({
  quantity: z.number().int().positive(),
  type: z.enum(["SALE", "PURCHASE", "ADJUSTMENT", "RETURN"]),
  reference: z.string().optional(),
});

async function getBusinessId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { ownedBusinesses: { select: { id: true }, take: 1 } },
  });
  return user?.ownedBusinesses[0]?.id ?? null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();

  // Check if it's a stock adjustment
  const adjustParsed = adjustSchema.safeParse(body);
  if (adjustParsed.success && body.type) {
    await adjustStock(id, adjustParsed.data.quantity, adjustParsed.data.type, adjustParsed.data.reference);
    return NextResponse.json({ ok: true });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const product = await updateProduct(businessId, id, parsed.data);
  return NextResponse.json(product);
}
