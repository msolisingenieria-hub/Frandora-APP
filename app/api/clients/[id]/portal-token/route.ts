import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { generatePortalToken } from "@/lib/services/client-portal.service";

const generateSchema = z.object({
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id: clientId } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = generateSchema.safeParse(body);
  const expiresInDays = parsed.success ? parsed.data.expiresInDays : 90;

  try {
    const token = await generatePortalToken(businessId, clientId, expiresInDays);
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cliente/${token}`;
    return NextResponse.json({ token, url: portalUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar acceso";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
