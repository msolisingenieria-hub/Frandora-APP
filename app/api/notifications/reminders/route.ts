import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { procesarRecordatoriosPendientes } from "@/lib/services/notification.service";

// Comparación constante en tiempo para evitar timing attacks sobre el secreto.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Llamado por cron externo (Vercel Cron / Upstash QStash).
// Header de seguridad: Authorization: Bearer $CRON_SECRET
//
// Fail-closed: el secreto es OBLIGATORIO siempre. Si no está configurado,
// el endpoint se rechaza por completo (503) en vez de quedar abierto.
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[cron/reminders] CRON_SECRET no configurado — endpoint rechazado.");
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
  }

  if (!authHeader || !safeEqual(authHeader, `Bearer ${cronSecret}`)) {
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
