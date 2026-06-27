import { NextRequest, NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { logImpersonation } from "@/lib/services/admin-businesses.service";

/**
 * Impersonación en modo solo-lectura.
 * Retorna el businessId para que el front lo almacene en una cookie de sesión
 * temporal (X-Admin-Impersonate) que el middleware puede usar para cambiar
 * el contexto de vista sin modificar la sesión de Clerk del admin.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

  await logImpersonation(params.id, admin.id);

  return NextResponse.json({
    businessId: params.id,
    adminId:    admin.id,
    mode:       "read_only",
    expiresIn:  3600,
  });
}
