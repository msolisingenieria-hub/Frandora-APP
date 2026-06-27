import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getForms, createForm } from "@/lib/services/form.service";

const createSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().nullable().optional(),
  type: z.enum(["PRE_APPOINTMENT", "POST_APPOINTMENT", "INTAKE", "CONSENT"]).optional(),
  isRequired: z.boolean().optional(),
  isConsent: z.boolean().optional(),
  sendBefore: z.number().int().min(0).max(168).optional(),
  sendVia: z.array(z.string()).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const forms = await getForms(businessId);
  return NextResponse.json(forms);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const form = await createForm(businessId, parsed.data);
  return NextResponse.json(form, { status: 201 });
}
