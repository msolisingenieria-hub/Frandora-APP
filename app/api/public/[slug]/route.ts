import { NextRequest, NextResponse } from "next/server";
import { getPublicBusinessData } from "@/lib/services/slots.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await getPublicBusinessData(params.slug);
    if (!data) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[public/slug] GET error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
