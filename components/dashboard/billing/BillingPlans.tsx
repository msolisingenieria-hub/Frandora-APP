"use client";

import { useState } from "react";
import { Check, Zap, Loader2 } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
  highlight: boolean;
};

type Props = {
  plans: Plan[];
  currentPlanId?: string;
};

export function BillingPlans({ plans, currentPlanId }: Props) {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/payments/rebill-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: `${planId}_${annual ? "annual" : "monthly"}` }),
      });
      if (!res.ok) throw new Error("Error al crear sesión de pago");
      const data = await res.json();
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      alert("No se pudo iniciar el pago. Verifica que las credenciales de Rebill estén configuradas.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {/* Toggle mensual/anual */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-sans font-medium ${!annual ? "text-brand-navy" : "text-slate-400"}`}>
          Mensual
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? "bg-brand-navy" : "bg-slate-200"}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${annual ? "translate-x-7" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-sans font-medium ${annual ? "text-brand-navy" : "text-slate-400"}`}>
          Anual
          <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-teal/15 text-brand-teal">
            20% OFF
          </span>
        </span>
      </div>

      {/* Grid de planes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const price = annual ? plan.annualPrice : plan.price;
          const isLoading = loading === plan.id;

          return (
            <div
              key={plan.id}
              className={[
                "rounded-2xl p-5 flex flex-col transition-all duration-200 relative",
                plan.highlight
                  ? "border-2 border-brand-teal shadow-lg"
                  : "border border-slate-200 shadow-brand",
                isCurrent ? "opacity-70" : "",
              ].join(" ")}
              style={plan.highlight ? { background: "linear-gradient(160deg, #ffffff 0%, rgba(111,168,158,0.05) 100%)" } : { background: "#ffffff" }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 text-[10px] font-sans font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
                    <Zap size={9} /> MÁS POPULAR
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-brand-navy font-sans font-bold text-base mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-brand-navy font-sans font-bold text-3xl">${price}</span>
                  <span className="text-slate-400 text-sm font-body">/mes</span>
                </div>
                {annual && (
                  <p className="text-slate-400 text-xs mt-0.5 font-body">
                    Facturado ${plan.annualPrice * 12}/año
                  </p>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={13} className="text-brand-teal mt-0.5 shrink-0" />
                    <span className="text-slate-600 text-xs font-body leading-tight">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrent && handleSelectPlan(plan.id)}
                disabled={isCurrent || !!loading}
                className={[
                  "w-full py-2.5 rounded-xl text-sm font-sans font-semibold flex items-center justify-center gap-2 transition-all",
                  isCurrent
                    ? "bg-slate-100 text-slate-400 cursor-default"
                    : plan.highlight
                    ? "text-white hover:-translate-y-px"
                    : "border border-slate-200 text-brand-navy hover:bg-slate-50",
                  loading && !isCurrent ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
                style={plan.highlight && !isCurrent ? { background: "linear-gradient(135deg, #0D1B2A, #1a3347)" } : {}}
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isCurrent ? (
                  "Plan actual"
                ) : (
                  "Seleccionar"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
