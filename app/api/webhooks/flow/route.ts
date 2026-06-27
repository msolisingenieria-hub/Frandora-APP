import { NextRequest, NextResponse } from "next/server";
import { confirmFlowPayment } from "@/lib/services/payment.service";
import { apiRateLimit } from "@/lib/cache/rate-limit";

// Flow envía POST con token en body (application/x-www-form-urlencoded)
// La verificación real ocurre en confirmFlowPayment → getFlowPaymentStatus (firmado con HMAC)
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const { success } = await apiRateLimit.limit(`flow:${ip}`);
  if (!success) {
    // Retornamos 200 aunque limitemos — Flow no debe reintentar indefinidamente
    return new NextResponse("rate limited", { status: 200 });
  }

  let token: string | null = null;
  try {
    const body = await req.formData();
    token = body.get("token") as string | null;
  } catch {
    return new NextResponse("bad request", { status: 200 });
  }

  if (!token) {
    return new NextResponse("missing token", { status: 200 });
  }

  try {
    await confirmFlowPayment(token);
  } catch (err) {
    // Logueamos pero respondemos 200 — si retornamos 500, Flow reintenta y puede duplicar
    console.error("[webhook/flow] error procesando token:", token, err);
  }

  // Flow espera 200 para no reintentar
  return new NextResponse("ok", { status: 200 });
}
