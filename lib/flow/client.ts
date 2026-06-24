// Flow.cl — pasarela de pago chilena
// Docs: https://www.flow.cl/docs/api.html

import crypto from "crypto";

const FLOW_API_URL = process.env.FLOW_API_URL ?? "https://sandbox.flow.cl/api";
const FLOW_API_KEY = process.env.FLOW_API_KEY ?? "";
const FLOW_SECRET  = process.env.FLOW_SECRET_KEY ?? "";

export type FlowPaymentParams = {
  commerceOrder: string;   // ID único de la orden en tu sistema
  subject: string;         // Descripción del pago
  amount: number;          // Monto en pesos CLP (entero)
  email: string;           // Email del pagador
  urlConfirmation: string; // Webhook de confirmación (POST)
  urlReturn: string;       // URL de retorno al usuario (GET)
  currency?: string;       // "CLP" por defecto
  paymentMethod?: number;  // 9 = todos los medios
};

export type FlowPaymentResponse = {
  url: string;     // URL base del formulario de pago
  token: string;   // Token para completar la URL: url + "?token=" + token
  flowOrder: number;
};

export type FlowPaymentStatus = {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: 1 | 2 | 3 | 4; // 1=pending, 2=paid, 3=rejected, 4=canceled
  subject: string;
  currency: string;
  amount: number;
  payer: string;
  optional?: Record<string, string>;
};

function sign(params: Record<string, string>): string {
  const keys = Object.keys(params).sort();
  const chain = keys.map((k) => `${k}${params[k]}`).join("");
  return crypto.createHmac("sha256", FLOW_SECRET).update(chain).digest("hex");
}

async function flowRequest<T>(
  method: "GET" | "POST",
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const allParams: Record<string, string> = { ...params, apiKey: FLOW_API_KEY };
  allParams["s"] = sign(allParams);

  const url = `${FLOW_API_URL}/${endpoint}`;

  if (method === "GET") {
    const qs = new URLSearchParams(allParams).toString();
    const res = await fetch(`${url}?${qs}`);
    if (!res.ok) throw new Error(`Flow API error: ${res.status}`);
    return res.json() as Promise<T>;
  }

  const body = new URLSearchParams(allParams);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Flow API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function createFlowPayment(p: FlowPaymentParams): Promise<FlowPaymentResponse> {
  return flowRequest<FlowPaymentResponse>("POST", "payment/create", {
    commerceOrder: p.commerceOrder,
    subject: p.subject,
    amount: String(Math.round(p.amount)),
    email: p.email,
    urlConfirmation: p.urlConfirmation,
    urlReturn: p.urlReturn,
    currency: p.currency ?? "CLP",
    paymentMethod: String(p.paymentMethod ?? 9),
  });
}

export async function getFlowPaymentStatus(token: string): Promise<FlowPaymentStatus> {
  return flowRequest<FlowPaymentStatus>("GET", "payment/getStatus", { token });
}

export function getFlowPaymentUrl(response: FlowPaymentResponse): string {
  return `${response.url}?token=${response.token}`;
}
