import { NextResponse } from "next/server";
import { cancelPortalAppointment } from "@/lib/services/client-portal.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string; appointmentId: string }> }
) {
  const { token, appointmentId } = await params;

  const ok = await cancelPortalAppointment(token, appointmentId);
  if (!ok) {
    return NextResponse.json({ error: "No se puede cancelar esta cita" }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
