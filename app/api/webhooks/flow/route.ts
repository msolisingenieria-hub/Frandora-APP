import { NextResponse } from "next/server";
import { confirmFlowPayment } from "@/lib/services/payment.service";

// Flow.cl envía POST con token en el body (application/x-www-form-urlencoded)
export async function POST(req: Request) {
  try {
    const body = await req.formData();
    const token = body.get("token");

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    await confirmFlowPayment(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Flow webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
