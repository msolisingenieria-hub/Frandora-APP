import { NextRequest, NextResponse } from "next/server";
import { enrollInClass, EnrollSchema, cancelEnrollment } from "@/lib/services/group-class.service";

type Params = { params: Promise<{ id: string }> };

// POST — inscribirse (público, sin auth)
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body   = await req.json();
  const parsed = EnrollSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  try {
    const enrollment = await enrollInClass(id, parsed.data);
    const msg =
      enrollment.status === "WAITLISTED"
        ? "Te anotamos en la lista de espera. Te avisaremos si se libera un cupo."
        : "¡Inscripción confirmada! Te esperamos.";
    return NextResponse.json({ enrollment, message: msg }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al inscribirse";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// DELETE — cancelar inscripción
export async function DELETE(req: NextRequest, { params }: Params) {
  const { searchParams } = new URL(req.url);
  const enrollmentId = searchParams.get("enrollmentId");
  if (!enrollmentId) return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 });

  void params; // classId no necesario para cancelar por enrollmentId
  await cancelEnrollment(enrollmentId);
  return NextResponse.json({ ok: true });
}
