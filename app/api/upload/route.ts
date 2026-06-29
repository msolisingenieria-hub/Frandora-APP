import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUploadUrl } from "@/lib/storage/upload";
import { getBusinessId } from "@/lib/auth/business";
import { z } from "zod";

const schema = z.object({
  folder: z.enum(["logos", "banners", "services", "staff", "before-after", "documents"]),
  contentType: z.string().min(1),
  fileSize: z.number().positive().max(10 * 1024 * 1024),
  businessId: z.string().optional(), // se ignora; se deriva del auth por seguridad
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const businessId = await getBusinessId(userId);
  if (!businessId) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const result = await getUploadUrl({
      businessId,
      folder: parsed.data.folder,
      contentType: parsed.data.contentType,
      fileSize: parsed.data.fileSize,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar URL de subida";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
