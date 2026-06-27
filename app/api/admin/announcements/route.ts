import { NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { listAnnouncements, createAnnouncement, announcementSchema } from "@/lib/services/admin-communications.service";

export async function GET() {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const announcements = await listAnnouncements();
  return NextResponse.json(announcements);
}

export async function POST(req: Request) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body: unknown = await req.json();
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const announcement = await createAnnouncement(parsed.data, admin.id);
  return NextResponse.json(announcement, { status: 201 });
}
