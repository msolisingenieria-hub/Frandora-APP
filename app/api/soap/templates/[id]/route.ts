import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { updateSoapTemplate, deleteSoapTemplate } from "@/lib/services/soap.service";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  serviceId: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const template = await updateSoapTemplate(businessId, id, parsed.data);
  if (!template) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });

  return NextResponse.json(template);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const ok = await deleteSoapTemplate(businessId, id);
  if (!ok) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
