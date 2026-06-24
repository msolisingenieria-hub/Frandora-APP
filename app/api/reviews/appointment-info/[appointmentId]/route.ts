import { NextResponse } from "next/server";
import { getAppointmentForReview } from "@/lib/services/review.service";

// Endpoint público — lo llama la página de reseña para mostrar contexto
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  const { appointmentId } = await params;
  const appt = await getAppointmentForReview(appointmentId);

  if (!appt) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

  return NextResponse.json({
    businessName: appt.business.name,
    businessSlug: appt.business.slug,
    serviceName:  appt.services[0]?.service?.name ?? "Servicio",
    staffName:    appt.staff?.name ?? null,
    businessId:   appt.businessId,
  });
}
