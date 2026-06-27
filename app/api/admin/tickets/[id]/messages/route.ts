import { NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { addTicketMessage, messageSchema } from "@/lib/services/admin-support.service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const body: unknown = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const message = await addTicketMessage(id, parsed.data.content, admin.id, admin.name, parsed.data.isInternal);
  return NextResponse.json(message, { status: 201 });
}
