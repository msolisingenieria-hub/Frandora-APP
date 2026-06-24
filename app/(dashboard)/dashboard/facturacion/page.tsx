import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { startOfMonth, endOfMonth } from "date-fns";
import { getPaymentsSummary } from "@/lib/services/payment.service";
import { BillingPlans } from "@/components/dashboard/billing/BillingPlans";
import { CreditCard, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata = { title: "Facturación | Frandora" };

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    annualPrice: 15,
    features: ["1 profesional", "1 ubicación", "100 reservas/mes", "50 SMS/mes", "POS incluido"],
    highlight: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 49,
    annualPrice: 39,
    features: ["3 profesionales", "1 ubicación", "500 reservas/mes", "200 SMS/mes", "Email marketing", "WhatsApp", "Gift cards"],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    annualPrice: 79,
    features: ["10 profesionales", "3 ubicaciones", "Ilimitadas reservas", "500 SMS/mes", "Marketing completo", "Dominio propio"],
    highlight: false,
  },
  {
    id: "scale",
    name: "Scale",
    price: 179,
    annualPrice: 143,
    features: ["Ilimitados profesionales", "Ilimitadas ubicaciones", "2000 SMS/mes", "API access", "Programa de lealtad"],
    highlight: false,
  },
];

export default async function FacturacionPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      ownedBusinesses: {
        include: {
          subscription: { include: { plan: true } },
        },
      },
    },
  });
  if (!user || user.ownedBusinesses.length === 0) redirect("/onboarding");

  const business = user.ownedBusinesses[0];
  const sub = business.subscription;

  const now = new Date();
  const summary = await getPaymentsSummary(business.id, startOfMonth(now), endOfMonth(now));

  const trialDays = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - Date.now()) / 86400000))
    : 14;

  const isTrialing = !sub || sub.status === "TRIALING";
  const isActive   = sub?.status === "ACTIVE";
  const isPastDue  = sub?.status === "PAST_DUE";

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CreditCard size={18} className="text-brand-teal" />
              <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">
                Suscripción Frandora
              </p>
            </div>
            <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
              Facturación
            </h1>
          </div>
        </div>

        {/* Estado de suscripción */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Plan actual */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5 md:col-span-2">
            <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider mb-3">Plan actual</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
                <CreditCard size={20} className="text-brand-teal" />
              </div>
              <div>
                <p className="text-brand-navy font-sans font-bold text-lg">
                  {isTrialing ? "Prueba gratuita" : (sub?.plan?.name ?? "Professional")}
                </p>
                {isTrialing ? (
                  <p className="text-brand-teal text-sm font-body">
                    {trialDays} días restantes
                  </p>
                ) : isActive ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <p className="text-emerald-600 text-sm font-body">Activo</p>
                  </div>
                ) : isPastDue ? (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={13} className="text-red-500" />
                    <p className="text-red-500 text-sm font-body">Pago pendiente</p>
                  </div>
                ) : null}
              </div>
            </div>
            {isTrialing && (
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${((14 - trialDays) / 14) * 100}%`,
                    background: "linear-gradient(90deg, #0D1B2A, #6FA89E)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Ingresos del mes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
            <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Cobros este mes
            </p>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-emerald-500" />
              <p className="text-brand-navy font-sans font-bold text-2xl">
                ${summary.total.toLocaleString("es-CL")}
              </p>
            </div>
            <p className="text-slate-400 text-xs font-body">{summary.count} pagos completados</p>
          </div>
        </div>

        {/* Planes */}
        <div className="mb-2">
          <h2 className="text-brand-navy font-sans font-bold text-xl mb-1">
            {isTrialing ? "Elige tu plan" : "Cambiar plan"}
          </h2>
          <p className="text-slate-400 text-sm font-body mb-6">
            Todos los planes incluyen 14 días de prueba gratuita. Cancela cuando quieras.
          </p>
          <BillingPlans plans={PLANS} currentPlanId={sub?.plan?.name?.toLowerCase()} />
        </div>
      </div>
    </div>
  );
}
