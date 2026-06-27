import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/services/slots.service";
import { redis } from "@/lib/cache/redis";
import { bookingRateLimit } from "@/lib/cache/rate-limit";

const CACHE_TTL = 120; // 2 minutos — los slots cambian al crear citas

const QuerySchema = z.object({
  businessId: z.string().min(1),
  serviceId:  z.string().min(1),
  date:       z.string().min(1),
  staffId:    z.string().optional(),
});

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const { success } = await bookingRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en un momento." },
      { status: 429 }
    );
  }

  const { searchParams } = req.nextUrl;
  const parsed = QuerySchema.safeParse({
    businessId: searchParams.get("businessId"),
    serviceId:  searchParams.get("serviceId"),
    date:       searchParams.get("date"),
    staffId:    searchParams.get("staffId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { businessId, serviceId, date, staffId } = parsed.data;
  const cacheKey = `slots:${businessId}:${serviceId}:${date}:${staffId ?? "any"}`;

  try {
    const cached = await redis.get<string[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ slots: cached, cached: true });
    }

    const slots = await getAvailableSlots({
      businessId,
      serviceId,
      staffId: staffId ?? null,
      date: new Date(date + "T12:00:00"),
    });

    await redis.set(cacheKey, slots, { ex: CACHE_TTL });
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("[slots] GET error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
