import { NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { listBroadcasts, createBroadcast, broadcastSchema } from "@/lib/services/admin-communications.service";

export async function GET() {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const broadcasts = await listBroadcasts();
  return NextResponse.json(broadcasts);
}

export async function POST(req: Request) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body: unknown = await req.json();
  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const broadcast = await createBroadcast(parsed.data, admin.id);
  return NextResponse.json(broadcast, { status: 201 });
}
