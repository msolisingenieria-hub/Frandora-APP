import { NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { getTicket, updateTicket, ticketUpdateSchema } from "@/lib/services/admin-support.service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });

  return NextResponse.json(ticket);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const body: unknown = await req.json();
  const parsed = ticketUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ticket = await updateTicket(id, parsed.data, admin.id);
  return NextResponse.json(ticket);
}
