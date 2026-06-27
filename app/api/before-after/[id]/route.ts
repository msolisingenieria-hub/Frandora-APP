import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import {
  getBeforeAfterPhoto, updateBeforeAfterPhoto, deleteBeforeAfterPhoto,
} from "@/lib/services/before-after.service";

const updateSchema = z.object({
  caption: z.string().nullable().optional(),
  serviceTag: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  hasConsent: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const photo = await getBeforeAfterPhoto(businessId, id);
  if (!photo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(photo);
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const photo = await updateBeforeAfterPhoto(businessId, id, parsed.data);
  if (!photo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(photo);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const ok = await deleteBeforeAfterPhoto(businessId, id);
  if (!ok) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
