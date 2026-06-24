import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { createSale, getDailySales } from "@/lib/services/pos.service";

const saleSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),
  })).min(1),
  method: z.enum(["CASH", "CARD", "TRANSFER", "QR", "MIXED"]),
  clientId: z.string().optional().nullable(),
  discount: z.number().min(0).optional(),
  tip: z.number().min(0).optional(),
  notes: z.string().optional(),
});

async function getBusinessId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { ownedBusinesses: { select: { id: true }, take: 1 } },
  });
  return user?.ownedBusinesses[0]?.id ?? null;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = saleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await createSale({ businessId, ...parsed.data });
  return NextResponse.json(result, { status: 201 });
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dateParam = new URL(req.url).searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  const summary = await getDailySales(businessId, date);
  return NextResponse.json(summary);
}
