import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { getProducts, createProduct } from "@/lib/services/inventory.service";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  costPrice: z.number().min(0).optional(),
  salePrice: z.number().min(0),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  categoryId: z.string().optional().nullable(),
});

async function getBusinessId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { ownedBusinesses: { select: { id: true }, take: 1 } },
  });
  return user?.ownedBusinesses[0]?.id ?? null;
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const search = new URL(req.url).searchParams.get("search") ?? undefined;
  const products = await getProducts(businessId, search);
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const product = await createProduct({ businessId, ...parsed.data });
  return NextResponse.json(product, { status: 201 });
}
