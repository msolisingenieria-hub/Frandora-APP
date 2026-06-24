import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { addTimeOff, deleteTimeOff, TimeOffSchema } from "@/lib/services/staff.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = TimeOffSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const result = await addTimeOff(id, businessId, parsed.data);
  if (!result) return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const timeOffId = searchParams.get("timeOffId");
  if (!timeOffId) return NextResponse.json({ error: "Falta timeOffId" }, { status: 400 });

  await deleteTimeOff(id, businessId, timeOffId);
  return NextResponse.json({ ok: true });
}
