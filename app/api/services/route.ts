import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getServices, createService } from "@/lib/services/service.service";

const createSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional().nullable(),
  duration:    z.number().int().positive(),
  price:       z.number().nonnegative(),
  isOnline:    z.boolean().optional(),
  categoryId:  z.string().optional().nullable(),
  imageUrl:    z.string().url().optional().nullable().or(z.literal("")),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const services = await getServices(businessId);
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const service = await createService({ businessId, ...parsed.data });
  return NextResponse.json(service, { status: 201 });
}
