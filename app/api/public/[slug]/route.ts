import { NextRequest, NextResponse } from "next/server";
import { getPublicBusinessData } from "@/lib/services/slots.service";
import { redis } from "@/lib/cache/redis";
import { apiRateLimit } from "@/lib/cache/rate-limit";

const CACHE_TTL = 300; // 5 minutos — el perfil del negocio cambia poco

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const { success } = await apiRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en un momento." },
      { status: 429 }
    );
  }

  const cacheKey = `business:public:${params.slug}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await getPublicBusinessData(params.slug);
    if (!data) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    await redis.set(cacheKey, data, { ex: CACHE_TTL });
    return NextResponse.json(data);
  } catch (err) {
    console.error("[public/slug] GET error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
