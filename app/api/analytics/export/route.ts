import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const now  = new Date();
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = searchParams.get("to")   ? new Date(searchParams.get("to")!)   : now;

  const appts = await prisma.appointment.findMany({
    where: { businessId, startTime: { gte: from, lte: to } },
    include: {
      clients:  { include: { client: { select: { name: true, phone: true, email: true } } } },
      staff:    { select: { name: true } },
      services: { include: { service: { select: { name: true } } } },
    },
    orderBy: { startTime: "asc" },
  });

  const rows = [
    ["Código","Estado","Fecha","Hora","Cliente","Teléfono","Profesional","Servicio","Precio"],
    ...appts.map(a => {
      const cl = a.clients[0]?.client;
      return [
        a.bookingCode,
        a.status,
        a.startTime.toLocaleDateString("es-CL"),
        a.startTime.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
        cl?.name  ?? a.notes ?? "",
        cl?.phone ?? "",
        a.staff?.name ?? "",
        a.services.map((s: { service: { name: string } }) => s.service.name).join(" + "),
        a.totalPrice.toFixed(0),
      ];
    }),
  ];

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const filename = `reporte-${from.toISOString().slice(0,10)}-${to.toISOString().slice(0,10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
