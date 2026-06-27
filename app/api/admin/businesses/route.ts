import { NextRequest, NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { listBusinesses } from "@/lib/services/admin-businesses.service";
import type { BusinessStatus, PlanTier } from "@prisma/client";

export async function GET(req: NextRequest) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const result = await listBusinesses({
    search:  sp.get("search")  ?? undefined,
    status:  (sp.get("status")  as BusinessStatus) ?? undefined,
    plan:    (sp.get("plan")    as PlanTier)        ?? undefined,
    page:    Number(sp.get("page"))    || 1,
    perPage: Number(sp.get("perPage")) || 25,
    sort:    (sp.get("sort") as "name" | "createdAt" | "status") ?? "createdAt",
    dir:     (sp.get("dir")  as "asc" | "desc")                  ?? "desc",
  });

  return NextResponse.json(result);
}
