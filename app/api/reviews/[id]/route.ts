import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { replyToReview, toggleReviewVisibility } from "@/lib/services/review.service";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const PatchSchema = z.object({
  reply:    z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  if (parsed.data.reply !== undefined) {
    await replyToReview(id, businessId, parsed.data.reply);
  }
  if (parsed.data.isPublic !== undefined) {
    await toggleReviewVisibility(id, businessId, parsed.data.isPublic);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  await prisma.review.deleteMany({ where: { id, businessId } });
  return NextResponse.json({ ok: true });
}
