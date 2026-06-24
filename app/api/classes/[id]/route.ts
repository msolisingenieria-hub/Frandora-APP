import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getGroupClassById, updateGroupClass, deleteGroupClass, GroupClassSchema } from "@/lib/services/group-class.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const groupClass = await getGroupClassById(id);
  if (!groupClass) return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });

  return NextResponse.json(groupClass);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body   = await req.json();
  const parsed = GroupClassSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const updated = await updateGroupClass(id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await deleteGroupClass(id);
  return NextResponse.json({ ok: true });
}
