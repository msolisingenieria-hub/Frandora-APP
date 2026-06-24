import { BUSINESS_CATEGORIES } from "@/types/onboarding";
import type { OnboardingData } from "@/types/onboarding";

type Props = {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
};

export function StepCategory({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-brand p-6 md:p-8">
        <p className="text-slate-500 text-sm mb-6">
          Selecciona la categoría que mejor describe tu negocio. Puedes cambiarla más adelante.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BUSINESS_CATEGORIES.map((cat) => {
            const isSelected = data.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ category: cat.id, categoryLabel: cat.label })}
                className={[
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center",
                  isSelected
                    ? "border-brand-navy bg-brand-navy text-white shadow-brand"
                    : "border-slate-200 bg-white text-brand-navy hover:border-brand-navy/40 hover:bg-brand-navy/5",
                ].join(" ")}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className={`text-xs font-sans font-medium leading-tight ${isSelected ? "text-white" : "text-brand-navy"}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
