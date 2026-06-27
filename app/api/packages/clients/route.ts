import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { listClientPackages } from "@/lib/services/package.service";
import type { ClientPackageStatus } from "@/types/package";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ?? undefined;
  const statusParam = searchParams.get("status") ?? undefined;
  const status = statusParam as ClientPackageStatus | undefined;

  const packages = await listClientPackages(businessId, clientId, status);
  return NextResponse.json(packages);
}
