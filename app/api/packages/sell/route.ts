import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { sellPackageToClient } from "@/lib/services/package.service";

const sellSchema = z.object({
  clientId: z.string().min(1),
  packageId: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = sellSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const clientPackage = await sellPackageToClient(businessId, parsed.data);
    return NextResponse.json(clientPackage, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al vender paquete";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
