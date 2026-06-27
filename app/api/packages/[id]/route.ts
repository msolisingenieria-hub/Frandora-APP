import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { updateSessionPackage, deleteSessionPackage } from "@/lib/services/package.service";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  sessions: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
  validDays: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const pkg = await updateSessionPackage(businessId, id, parsed.data);
  if (!pkg) return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });

  return NextResponse.json(pkg);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const ok = await deleteSessionPackage(businessId, id);
  if (!ok) return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
