import { NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { listTickets } from "@/lib/services/admin-support.service";

export async function GET(req: Request) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const tickets = await listTickets(status);
  return NextResponse.json(tickets);
}
