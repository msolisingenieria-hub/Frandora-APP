import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Rate limit general para APIs autenticadas: 60 req/min por IP
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "frandora:api",
});

// Rate limit estricto para reservas públicas: 10 req/min por IP
export const bookingRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "frandora:booking",
});

// Rate limit para auth: 5 intentos/min por IP (previene brute force)
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "frandora:auth",
});
