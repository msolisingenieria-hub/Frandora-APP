import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { listSessionPackages, createSessionPackage } from "@/lib/services/package.service";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  sessions: z.number().int().min(1),
  price: z.number().min(0),
  validDays: z.number().int().min(0).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const packages = await listSessionPackages(businessId);
  return NextResponse.json(packages);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const pkg = await createSessionPackage(businessId, parsed.data);
  return NextResponse.json(pkg, { status: 201 });
}
