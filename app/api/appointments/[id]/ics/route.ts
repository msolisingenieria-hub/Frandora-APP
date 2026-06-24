import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { buildIcsFile } from "@/lib/services/calendar-export.service";

type Params = { params: Promise<{ id: string }> };

// GET — descargar archivo ICS de una cita (público con bookingCode como query param)
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const appt = await prisma.appointment.findFirst({
    where: code ? { bookingCode: code } : { id },
    include: {
      business: { select: { name: true, slug: true } },
      services: { select: { serviceName: true } },
      staff:    { select: { name: true } },
    },
  });

  if (!appt) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

  const serviceNames = appt.services.map(s => s.serviceName).join(", ") || "Servicio";
  const staffLine    = appt.staff ? ` con ${appt.staff.name}` : "";

  const icsContent = buildIcsFile({
    uid:         appt.bookingCode,
    summary:     `${serviceNames}${staffLine} — ${appt.business.name}`,
    description: `Código de reserva: #${appt.bookingCode}\nTotal: $${appt.totalPrice.toLocaleString("es-CL")}`,
    start:       appt.startTime,
    end:         appt.endTime,
    url:         `https://${appt.business.slug}.frandora.cl`,
  });

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type":        "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="cita-${appt.bookingCode}.ics"`,
    },
  });
}
