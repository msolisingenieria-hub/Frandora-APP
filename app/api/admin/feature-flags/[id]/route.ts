import { NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { updateFeatureFlag, deleteFeatureFlag, featureFlagSchema } from "@/lib/services/admin-feature-flags.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const body: unknown = await req.json();
  const parsed = featureFlagSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const flag = await updateFeatureFlag(id, parsed.data, admin.id);
  return NextResponse.json(flag);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  await deleteFeatureFlag(id, admin.id);
  return NextResponse.json({ ok: true });
}
