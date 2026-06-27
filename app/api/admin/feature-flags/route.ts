import { NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { listFeatureFlags, createFeatureFlag, featureFlagSchema } from "@/lib/services/admin-feature-flags.service";

export async function GET() {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const flags = await listFeatureFlags();
  return NextResponse.json(flags);
}

export async function POST(req: Request) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body: unknown = await req.json();
  const parsed = featureFlagSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const flag = await createFeatureFlag(parsed.data, admin.id);
  return NextResponse.json(flag, { status: 201 });
}
