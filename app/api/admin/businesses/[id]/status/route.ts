import { NextRequest, NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { suspendBusiness, reactivateBusiness } from "@/lib/services/admin-businesses.service";
import { z } from "zod";

const schema = z.object({ action: z.enum(["suspend", "reactivate"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Acción inválida" }, { status: 400 });

  if (parsed.data.action === "suspend") {
    await suspendBusiness(params.id, admin.id);
  } else {
    await reactivateBusiness(params.id, admin.id);
  }

  return NextResponse.json({ ok: true });
}
