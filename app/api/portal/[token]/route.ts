import { NextResponse } from "next/server";
import { getPortalData } from "@/lib/services/client-portal.service";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const data = await getPortalData(token);
  if (!data) {
    return NextResponse.json({ error: "Acceso no válido o vencido" }, { status: 403 });
  }

  return NextResponse.json(data);
}
