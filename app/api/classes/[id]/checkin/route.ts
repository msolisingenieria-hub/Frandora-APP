import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkInEnrollment } from "@/lib/services/group-class.service";

type Params = { params: Promise<{ id: string }> };

// PATCH — marcar asistencia de un inscrito
export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  void params;
  const { enrollmentId } = await req.json();
  if (!enrollmentId) return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 });

  const updated = await checkInEnrollment(enrollmentId);
  return NextResponse.json(updated);
}
