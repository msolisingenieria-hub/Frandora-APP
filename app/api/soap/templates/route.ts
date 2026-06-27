import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getSoapTemplates, createSoapTemplate } from "@/lib/services/soap.service";

const extraFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "number", "boolean"]),
});

const createSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  serviceId: z.string().nullable().optional(),
  extraFields: z.array(extraFieldSchema).optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const templates = await getSoapTemplates(businessId);
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const template = await createSoapTemplate(businessId, parsed.data);
  return NextResponse.json(template, { status: 201 });
}
