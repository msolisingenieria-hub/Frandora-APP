import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getSoapNote, updateSoapNote, deleteSoapNote } from "@/lib/services/soap.service";

const updateSchema = z.object({
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  extraFields: z.record(z.unknown()).optional(),
  isPrivate: z.boolean().optional(),
  staffId: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const note = await getSoapNote(businessId, id);
  if (!note) return NextResponse.json({ error: "Ficha no encontrada" }, { status: 404 });

  return NextResponse.json(note);
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

  const note = await updateSoapNote(businessId, id, parsed.data);
  if (!note) return NextResponse.json({ error: "Ficha no encontrada" }, { status: 404 });

  return NextResponse.json(note);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const ok = await deleteSoapNote(businessId, id);
  if (!ok) return NextResponse.json({ error: "Ficha no encontrada" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
