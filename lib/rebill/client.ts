// Rebill — plataforma de suscripciones para Latam
// Docs: https://rebill.com/docs

import { createHmac } from "crypto";

const REBILL_API_URL = "https://api.rebill.to/v2";
const REBILL_API_KEY  = process.env.REBILL_API_KEY ?? "";
const REBILL_ORG_ID   = process.env.REBILL_ORGANIZATION_ID ?? "";

export type RebillPlan = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
  trialDays?: number;
};

export type RebillSubscription = {
  id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  planId: string;
  customerId: string;
  currentPeriodEnd: string;
  trialEnd?: string;
};

export type RebillCheckoutParams = {
  planId: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
};

export type RebillCheckoutResponse = {
  checkoutUrl: string;
  sessionId: string;
};

async function rebillRequest<T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${REBILL_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${REBILL_API_KEY}`,
      "X-Organization-Id": REBILL_ORG_ID,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Rebill API error ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

export async function createRebillCheckout(
  params: RebillCheckoutParams
): Promise<RebillCheckoutResponse> {
  return rebillRequest<RebillCheckoutResponse>("POST", "/checkout/sessions", {
    planId: params.planId,
    customer: {
      email: params.customerEmail,
      name: params.customerName,
    },
    metadata: params.metadata ?? {},
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  });
}

export async function getRebillSubscription(
  subscriptionId: string
): Promise<RebillSubscription> {
  return rebillRequest<RebillSubscription>("GET", `/subscriptions/${subscriptionId}`);
}

export async function cancelRebillSubscription(
  subscriptionId: string
): Promise<void> {
  await rebillRequest("DELETE", `/subscriptions/${subscriptionId}`);
}

export async function listRebillPlans(): Promise<RebillPlan[]> {
  return rebillRequest<RebillPlan[]>("GET", "/plans");
}

// Verifica la firma del webhook de Rebill
export function verifyRebillWebhook(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.REBILL_WEBHOOK_SECRET ?? "";
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return expected === signature;
}
