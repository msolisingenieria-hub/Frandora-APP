import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { useSession } from "@/lib/services/package.service";

const useSchema = z.object({
  count: z.number().int().min(1).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const parsed = useSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const updated = await useSession(businessId, id, parsed.data.count ?? 1);
    if (!updated) return NextResponse.json({ error: "Paquete no encontrado o inactivo" }, { status: 404 });
    return NextResponse.json({ ok: true, sessionsRemaining: updated.sessionsRemaining });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al usar sesión";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
