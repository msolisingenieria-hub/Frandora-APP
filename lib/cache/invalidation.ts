import { redis } from "./redis";

// Invalida los slots de un negocio para una fecha específica (al crear/cancelar cita)
export async function invalidateSlotsCache(businessId: string, date: string) {
  const pattern = `slots:${businessId}:*:${date}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Invalida el perfil público de un negocio (al cambiar servicios/staff/ajustes)
export async function invalidatePublicBusinessCache(slug: string) {
  await redis.del(`business:public:${slug}`);
}

// Invalida toda la caché de un negocio (operación pesada — solo para cambios críticos)
export async function invalidateAllBusinessCache(businessId: string, slug: string) {
  const keys = await redis.keys(`slots:${businessId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
  await redis.del(`business:public:${slug}`);
}
