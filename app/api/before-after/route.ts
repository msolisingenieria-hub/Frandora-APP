import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getBeforeAfterPhotos, createBeforeAfterPhoto } from "@/lib/services/before-after.service";

const createSchema = z.object({
  appointmentId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  staffId: z.string().nullable().optional(),
  beforeKey: z.string().min(1, "La foto 'Antes' es obligatoria"),
  afterKey: z.string().min(1, "La foto 'Después' es obligatoria"),
  beforeUrl: z.string().url(),
  afterUrl: z.string().url(),
  caption: z.string().nullable().optional(),
  serviceTag: z.string().nullable().optional(),
  hasConsent: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId") ?? undefined;
  const serviceTag = searchParams.get("serviceTag") ?? undefined;
  const isPublicParam = searchParams.get("isPublic");
  const isPublic = isPublicParam === "true" ? true : isPublicParam === "false" ? false : undefined;
  const page = Number(searchParams.get("page") ?? 1);

  const result = await getBeforeAfterPhotos(businessId, { staffId, serviceTag, isPublic, page });
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

  const photo = await createBeforeAfterPhoto(businessId, parsed.data);
  return NextResponse.json(photo, { status: 201 });
}
