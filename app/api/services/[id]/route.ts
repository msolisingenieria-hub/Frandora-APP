import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { updateService, deleteService } from "@/lib/services/service.service";

const updateSchema = z.object({
  name:        z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  duration:    z.number().int().positive().optional(),
  price:       z.number().nonnegative().optional(),
  isOnline:    z.boolean().optional(),
  categoryId:  z.string().optional().nullable(),
  imageUrl:    z.string().url().optional().nullable().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const service = await updateService(params.id, businessId, parsed.data);
  return NextResponse.json(service);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  await deleteService(params.id, businessId);
  return NextResponse.json({ success: true });
}
