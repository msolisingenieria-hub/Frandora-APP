import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getForm, updateForm, deleteForm, duplicateForm } from "@/lib/services/form.service";

const fieldSchema = z.object({
  label: z.string().min(1),
  type: z.enum(["TEXT", "TEXTAREA", "NUMBER", "SELECT", "CHECKBOX", "BOOLEAN", "DATE", "PHONE", "EMAIL", "SIGNATURE", "SCALE"]),
  placeholder: z.string().nullable().optional(),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().optional(),
  order: z.number().int().optional(),
  min: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  helpText: z.string().nullable().optional(),
  defaultValue: z.string().nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  type: z.enum(["PRE_APPOINTMENT", "POST_APPOINTMENT", "INTAKE", "CONSENT"]).optional(),
  isRequired: z.boolean().optional(),
  isConsent: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sendBefore: z.number().int().min(0).max(168).optional(),
  sendVia: z.array(z.string()).optional(),
  fields: z.array(fieldSchema).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const form = await getForm(businessId, id);
  if (!form) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });

  return NextResponse.json(form);
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();

  if (body.action === "duplicate") {
    const copy = await duplicateForm(businessId, id);
    if (!copy) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(copy);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const form = await updateForm(businessId, id, parsed.data);
  if (!form) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });

  return NextResponse.json(form);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const ok = await deleteForm(businessId, id);
  if (!ok) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
