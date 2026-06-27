import { NextRequest, NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { getBusinessDetail } from "@/lib/services/admin-businesses.service";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

  const biz = await getBusinessDetail(params.id);
  if (!biz) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  return NextResponse.json(biz);
}
