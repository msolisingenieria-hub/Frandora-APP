import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { createRebillCheckout } from "@/lib/rebill/client";

const schema = z.object({
  planId: z.string().min(1),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { ownedBusinesses: { select: { id: true, name: true } } },
  });
  if (!user || user.ownedBusinesses.length === 0) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const business = user.ownedBusinesses[0];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.frandora.cl";

  const checkout = await createRebillCheckout({
    planId: parsed.data.planId,
    customerEmail: user.email,
    customerName: user.name ?? business.name,
    metadata: { businessId: business.id },
    successUrl: `${baseUrl}/dashboard/facturacion?success=1`,
    cancelUrl: `${baseUrl}/dashboard/facturacion?canceled=1`,
  });

  return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
}
