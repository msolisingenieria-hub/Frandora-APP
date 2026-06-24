"use client";

import { ONBOARDING_PLANS } from "@/types/onboarding";
import type { OnboardingData } from "@/types/onboarding";

type Props = {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
};

export function StepPlan({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Toggle anual/mensual */}
      <div className="bg-white rounded-2xl shadow-brand p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-sans font-medium text-brand-navy">Facturación anual</p>
          <p className="text-xs text-slate-400">Ahorra 20% pagando anualmente</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={data.isAnnual}
          onClick={() => onChange({ isAnnual: !data.isAnnual })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${data.isAnnual ? "bg-brand-navy" : "bg-slate-300"}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${data.isAnnual ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ONBOARDING_PLANS.map((plan) => {
          const isSelected = data.planTier === plan.tier;
          const price = data.isAnnual ? plan.annualPrice : plan.monthlyPrice;

          return (
            <button
              key={plan.tier}
              type="button"
              onClick={() => onChange({ planTier: plan.tier })}
              className={[
                "text-left p-5 rounded-2xl border-2 transition-all duration-200 relative",
                isSelected
                  ? "border-brand-navy bg-brand-navy text-white shadow-brand-lg"
                  : "border-slate-200 bg-white text-brand-navy hover:border-brand-navy/40",
              ].join(" ")}
            >
              {plan.isPopular && (
                <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-sans font-semibold px-3 py-0.5 rounded-full ${isSelected ? "bg-brand-teal text-white" : "bg-brand-navy text-white"}`}>
                  Más popular
                </span>
              )}

              <div className="flex items-baseline justify-between mb-3">
                <span className={`font-sans font-bold text-lg ${isSelected ? "text-white" : "text-brand-navy"}`}>{plan.name}</span>
                <div className="text-right">
                  <span className={`font-sans font-bold text-xl ${isSelected ? "text-white" : "text-brand-navy"}`}>${price}</span>
                  <span className={`text-xs ${isSelected ? "text-white/60" : "text-slate-400"}`}>/mes</span>
                </div>
              </div>

              <p className={`text-xs mb-3 font-sans ${isSelected ? "text-brand-teal" : "text-brand-teal"}`}>
                {plan.staff}
              </p>

              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <span className={isSelected ? "text-brand-teal" : "text-brand-teal"}>✓</span>
                    <span className={isSelected ? "text-white/80" : "text-slate-600"}>{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 pb-2">
        Todos los planes incluyen 14 días de prueba gratis · Sin tarjeta de crédito
      </p>
    </div>
  );
}
