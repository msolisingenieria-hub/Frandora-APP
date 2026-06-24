import { NextResponse } from "next/server";
import { verifyRebillWebhook } from "@/lib/rebill/client";
import { prisma } from "@/lib/db/client";
import type { SubscriptionStatus } from "@prisma/client";

type RebillEvent = {
  type: string;
  data: {
    id?: string;
    status?: string;
    currentPeriodEnd?: string;
    trialEnd?: string;
  };
};

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  active:    "ACTIVE",
  trialing:  "TRIALING",
  past_due:  "PAST_DUE",
  canceled:  "CANCELED",
  unpaid:    "UNPAID",
};

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-rebill-signature") ?? "";

  if (!verifyRebillWebhook(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event: RebillEvent = JSON.parse(payload);
  const { type, data } = event;

  switch (type) {
    case "subscription.activated":
    case "subscription.updated":
    case "subscription.trial_started": {
      if (!data.id) break;
      const status = STATUS_MAP[data.status ?? "active"] ?? "ACTIVE";
      await prisma.subscription.updateMany({
        where: { rebillSubId: data.id },
        data: {
          status,
          currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
          trialEndsAt: data.trialEnd ? new Date(data.trialEnd) : undefined,
        },
      });
      break;
    }

    case "subscription.canceled": {
      if (data.id) {
        await prisma.subscription.updateMany({
          where: { rebillSubId: data.id },
          data: { status: "CANCELED" },
        });
      }
      break;
    }

    case "subscription.past_due": {
      if (data.id) {
        await prisma.subscription.updateMany({
          where: { rebillSubId: data.id },
          data: { status: "PAST_DUE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
