import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { notifyWaitlistEntry, confirmWaitlistEntry, removeFromWaitlist } from "@/lib/services/waitlist.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id }     = await params;
  const { action } = await req.json();

  if (action === "notify")   { const r = await notifyWaitlistEntry(id);  return NextResponse.json(r); }
  if (action === "confirm")  { const r = await confirmWaitlistEntry(id); return NextResponse.json(r); }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await removeFromWaitlist(id);
  return NextResponse.json({ ok: true });
}
