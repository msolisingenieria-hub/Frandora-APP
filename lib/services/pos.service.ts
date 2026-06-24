import { prisma } from "@/lib/db/client";
import { adjustStock } from "@/lib/services/inventory.service";

export type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type CreateSaleInput = {
  businessId: string;
  staffId?: string | null;
  clientId?: string | null;
  items: SaleItem[];
  method: "CASH" | "CARD" | "TRANSFER" | "QR" | "MIXED";
  discount?: number;
  tip?: number;
  notes?: string;
};

export type SaleResult = {
  paymentId: string;
  total: number;
  items: { name: string; quantity: number; unitPrice: number; subtotal: number }[];
};

export async function createSale(input: CreateSaleInput): Promise<SaleResult> {
  const { businessId, clientId, items, method, discount = 0, tip = 0, notes } = input;

  // Fetch all products
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, businessId },
    select: { id: true, name: true, salePrice: true },
  });

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const lineItems = items.map((item) => {
    const product = productMap[item.productId];
    if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
    return {
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
    };
  });

  const subtotal  = lineItems.reduce((s, i) => s + i.subtotal, 0);
  const total     = subtotal - discount + tip;

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      businessId,
      clientId: clientId ?? null,
      amount: subtotal,
      discount,
      tip,
      total,
      currency: "CLP",
      method,
      status: "COMPLETED",
      notes: notes ?? null,
    },
  });

  // Discount inventory for each product
  await Promise.all(
    items.map((item) =>
      adjustStock(item.productId, item.quantity, "SALE", payment.id)
    )
  );

  return {
    paymentId: payment.id,
    total,
    items: lineItems,
  };
}

export async function getDailySales(businessId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const payments = await prisma.payment.findMany({
    where: {
      businessId,
      status: "COMPLETED",
      createdAt: { gte: start, lte: end },
    },
    select: { total: true, method: true, tip: true, discount: true },
  });

  const total    = payments.reduce((s, p) => s + p.total, 0);
  const tips     = payments.reduce((s, p) => s + p.tip, 0);
  const discounts = payments.reduce((s, p) => s + p.discount, 0);
  const byMethod  = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + p.total;
    return acc;
  }, {});

  return { total, tips, discounts, count: payments.length, byMethod };
}
