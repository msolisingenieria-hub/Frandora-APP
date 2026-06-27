import { prisma } from "@/lib/db/client";
import type { PlanTier, Subscription, Plan } from "@prisma/client";

export interface PlanBreakdown {
  tier: PlanTier;
  name: string;
  activeCount: number;
  mrr: number;
  ltv: number;
}

export interface AdminFinancials {
  mrr: number;
  arr: number;
  churnRate: number; // 0–1
  activeSubscribers: number;
  trialingCount: number;
  pastDueCount: number;
  newBusinesses: { today: number; week: number; month: number };
  projectedNextMonth: number;
  averageLtv: number;
  planBreakdown: PlanBreakdown[];
}

type SubWithPlan = Subscription & { plan: Plan };

/** Valor mensual normalizado de una suscripción (anual → /12). */
function monthlyValue(sub: SubWithPlan): number {
  return sub.isAnnual ? sub.plan.annualPrice / 12 : sub.plan.monthlyPrice;
}

function startOf(period: "day" | "week" | "month"): Date {
  const now = new Date();
  if (period === "day") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  // semana: lunes como inicio
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  return monday;
}

export async function getAdminFinancials(): Promise<AdminFinancials> {
  const monthStart = startOf("month");

  const [subscriptions, canceledThisMonth, newToday, newWeek, newMonth] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
      include: { plan: true },
    }),
    prisma.subscription.count({
      where: { status: "CANCELED", updatedAt: { gte: monthStart } },
    }),
    prisma.business.count({ where: { createdAt: { gte: startOf("day") } } }),
    prisma.business.count({ where: { createdAt: { gte: startOf("week") } } }),
    prisma.business.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  const active = subscriptions.filter((s) => s.status === "ACTIVE");
  const trialingCount = subscriptions.filter((s) => s.status === "TRIALING").length;
  const pastDueCount = subscriptions.filter((s) => s.status === "PAST_DUE").length;

  const mrr = active.reduce((sum, s) => sum + monthlyValue(s), 0);
  const arr = mrr * 12;

  // Churn mensual: cancelados este mes / base activa al inicio del mes (aprox)
  const activeBaseStart = active.length + canceledThisMonth;
  const churnRate = activeBaseStart > 0 ? canceledThisMonth / activeBaseStart : 0;

  // LTV = ARPA / churn (piso de churn 5% para no inflar el LTV)
  const ltvChurn = Math.max(churnRate, 0.05);

  // Desglose por plan
  const byTier = new Map<PlanTier, { name: string; count: number; mrr: number }>();
  for (const s of active) {
    const entry = byTier.get(s.plan.tier) ?? { name: s.plan.name, count: 0, mrr: 0 };
    entry.count += 1;
    entry.mrr += monthlyValue(s);
    byTier.set(s.plan.tier, entry);
  }

  const planBreakdown: PlanBreakdown[] = [...byTier.entries()].map(([tier, v]) => {
    const arpa = v.count > 0 ? v.mrr / v.count : 0;
    return { tier, name: v.name, activeCount: v.count, mrr: v.mrr, ltv: arpa / ltvChurn };
  });

  const averageLtv = active.length > 0 ? (mrr / active.length) / ltvChurn : 0;

  // Proyección simple: MRR retenido tras churn del mes
  const projectedNextMonth = mrr * (1 - churnRate);

  return {
    mrr,
    arr,
    churnRate,
    activeSubscribers: active.length,
    trialingCount,
    pastDueCount,
    newBusinesses: { today: newToday, week: newWeek, month: newMonth },
    projectedNextMonth,
    averageLtv,
    planBreakdown,
  };
}
