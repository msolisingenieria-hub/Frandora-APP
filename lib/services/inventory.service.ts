import { prisma } from "@/lib/db/client";

export type ProductListItem = {
  id: string;
  name: string;
  sku: string | null;
  salePrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
  categoryName: string | null;
  lowStock: boolean;
};

export type CreateProductInput = {
  businessId: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  costPrice?: number;
  salePrice: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  categoryId?: string | null;
};

export type UpdateProductInput = Partial<Omit<CreateProductInput, "businessId">>;

export async function getProducts(
  businessId: string,
  search?: string
): Promise<ProductListItem[]> {
  const raw = await prisma.product.findMany({
    where: {
      businessId,
      isActive: true,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    },
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    salePrice: p.salePrice,
    costPrice: p.costPrice,
    stock: p.stock,
    minStock: p.minStock,
    unit: p.unit,
    isActive: p.isActive,
    categoryName: p.category?.name ?? null,
    lowStock: p.stock <= p.minStock,
  }));
}

export async function createProduct(input: CreateProductInput): Promise<ProductListItem> {
  const { businessId, ...rest } = input;
  const p = await prisma.product.create({
    data: { businessId, ...rest },
    include: { category: { select: { name: true } } },
  });
  return {
    id: p.id, name: p.name, sku: p.sku,
    salePrice: p.salePrice, costPrice: p.costPrice,
    stock: p.stock, minStock: p.minStock, unit: p.unit,
    isActive: p.isActive,
    categoryName: p.category?.name ?? null,
    lowStock: p.stock <= p.minStock,
  };
}

export async function updateProduct(
  businessId: string,
  productId: string,
  input: UpdateProductInput
): Promise<ProductListItem> {
  const p = await prisma.product.update({
    where: { id: productId, businessId },
    data: input,
    include: { category: { select: { name: true } } },
  });
  return {
    id: p.id, name: p.name, sku: p.sku,
    salePrice: p.salePrice, costPrice: p.costPrice,
    stock: p.stock, minStock: p.minStock, unit: p.unit,
    isActive: p.isActive,
    categoryName: p.category?.name ?? null,
    lowStock: p.stock <= p.minStock,
  };
}

export async function adjustStock(
  productId: string,
  quantity: number,
  type: "SALE" | "PURCHASE" | "ADJUSTMENT" | "RETURN",
  reference?: string
): Promise<void> {
  const delta = type === "SALE" ? -quantity : quantity;

  await prisma.$transaction([
    prisma.inventoryMovement.create({
      data: { productId, type, quantity, reference },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: delta } },
    }),
  ]);
}

export async function getCategories(businessId: string) {
  return prisma.productCategory.findMany({
    where: { businessId, isActive: true },
    orderBy: { order: "asc" },
  });
}
