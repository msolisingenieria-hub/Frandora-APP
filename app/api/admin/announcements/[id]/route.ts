import { NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { updateAnnouncement, deleteAnnouncement, announcementSchema } from "@/lib/services/admin-communications.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const body: unknown = await req.json();
  const parsed = announcementSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await updateAnnouncement(id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  await deleteAnnouncement(id, admin.id);
  return NextResponse.json({ ok: true });
}
