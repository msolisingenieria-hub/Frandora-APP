import { NextRequest, NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { changeBusinessPlan } from "@/lib/services/admin-businesses.service";
import { z } from "zod";

const schema = z.object({
  tier: z.enum(["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE", "ENTERPRISE"]),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Plan inválido" }, { status: 400 });

  try {
    await changeBusinessPlan(params.id, parsed.data.tier, admin.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo cambiar el plan" }, { status: 422 });
  }
}
