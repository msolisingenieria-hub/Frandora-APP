import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPublicAppointment, resolveBusinessIdBySlug } from "@/lib/services/appointment.service";
import { notifyConfirmacion } from "@/lib/services/notification.service";
import { bookingRateLimit } from "@/lib/cache/rate-limit";

const BodySchema = z.object({
  slug:        z.string().min(1),
  serviceId:   z.string().min(1),
  staffId:     z.string().nullable().optional(),
  startTime:   z.string().min(1),
  clientName:  z.string().min(2, "Nombre requerido"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().min(8, "Teléfono requerido"),
  notes:       z.string().optional(),
  hp:          z.string().optional(), // honeypot anti-bot
});

const isProd = process.env.NODE_ENV === "production";

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

/**
 * Aplica un límite de tasa. Fail-closed en producción: si el backend de
 * rate limit (Redis) falla, se bloquea la solicitud en vez de dejarla pasar.
 * En desarrollo se deja pasar para no frenar el trabajo local.
 */
async function rateLimitOk(key: string): Promise<boolean> {
  try {
    const { success } = await bookingRateLimit.limit(key);
    return success;
  } catch (err) {
    console.error("[appointments/public] rate limit backend error:", err);
    return !isProd; // prod => bloquea; dev => permite
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { slug, hp, ...data } = parsed.data;

    // Honeypot: si viene relleno, es un bot. Rechazo genérico.
    if (hp && hp.trim().length > 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });
    }

    // Rate limit por IP y por IP+slug (frena spam global y por negocio).
    const ip = getClientIp(req);
    const [ipOk, ipSlugOk] = await Promise.all([
      rateLimitOk(`booking:ip:${ip}`),
      rateLimitOk(`booking:ip-slug:${ip}:${slug}`),
    ]);
    if (!ipOk || !ipSlugOk) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta en un momento." },
        { status: 429 }
      );
    }

    // El negocio se resuelve server-side desde el slug — nunca se confía
    // en un businessId enviado por el cliente.
    const businessId = await resolveBusinessIdBySlug(slug);
    if (!businessId) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const result = await createPublicAppointment({
      businessId,
      serviceId:   data.serviceId,
      staffId:     data.staffId ?? null,
      startTime:   data.startTime,
      clientName:  data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      notes:       data.notes,
    });

    // Enviar confirmación sin bloquear la respuesta
    notifyConfirmacion(result.appointmentId).catch(() => null);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[appointments/public] POST error:", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
