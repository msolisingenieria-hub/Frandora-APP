import { NextResponse } from "next/server";
import { procesarRecordatoriosPendientes } from "@/lib/services/notification.service";

// Llamado por cron externo (Vercel Cron / Upstash QStash) cada 30 minutos
// Header de seguridad: Authorization: Bearer $CRON_SECRET
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await procesarRecordatoriosPendientes();

  return NextResponse.json({
    ok: true,
    enviados: `${result.en24h} recordatorio(s) 24h, ${result.en2h} recordatorio(s) 2h`,
  });
}

// GET para Vercel Cron (usa GET por defecto)
export async function GET(req: Request) {
  return POST(req);
}
