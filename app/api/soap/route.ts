import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getSoapNotes, createSoapNote } from "@/lib/services/soap.service";

const createSchema = z.object({
  clientId: z.string().nullable().optional(),
  appointmentId: z.string().nullable().optional(),
  staffId: z.string().nullable().optional(),
  templateId: z.string().nullable().optional(),
  subjective: z.string().min(1, "Campo obligatorio"),
  objective: z.string().min(1, "Campo obligatorio"),
  assessment: z.string().min(1, "Campo obligatorio"),
  plan: z.string().min(1, "Campo obligatorio"),
  extraFields: z.record(z.unknown()).optional(),
  isPrivate: z.boolean().optional(),
});

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ?? undefined;
  const appointmentId = searchParams.get("appointmentId") ?? undefined;
  const page = Number(searchParams.get("page") ?? 1);

  const result = await getSoapNotes(businessId, { clientId, appointmentId, page });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const note = await createSoapNote(businessId, parsed.data);
  return NextResponse.json(note, { status: 201 });
}
