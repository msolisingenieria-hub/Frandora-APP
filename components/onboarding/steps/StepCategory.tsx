import {
  Scissors, Wind, Sparkles, Waves, Hand, HeartPulse, Stethoscope,
  Smile, Activity, Brain, Apple, Dumbbell, Flame, PenTool, PawPrint,
  TrendingUp, LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/types/onboarding";
import type { OnboardingData } from "@/types/onboarding";

const ICON_MAP: Record<string, LucideIcon> = {
  Scissors, Wind, Sparkles, Waves, Hand, HeartPulse, Stethoscope,
  Smile, Activity, Brain, Apple, Dumbbell, Flame, PenTool, PawPrint,
  TrendingUp, LayoutGrid,
};

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
            const Icon = ICON_MAP[cat.iconName] ?? LayoutGrid;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ category: cat.id, categoryLabel: cat.label })}
                className={[
                  "group flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6FA89E]",
                  isSelected
                    ? "border-[#0D1B2A] bg-[#0D1B2A] text-white shadow-lg scale-[1.02]"
                    : "border-slate-200 bg-white text-[#0D1B2A] hover:border-[#6FA89E] hover:shadow-md hover:scale-[1.01]",
                ].join(" ")}
              >
                <div className={[
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-white/15"
                    : "bg-[#F2F4F6] group-hover:bg-[#CFE3DF]",
                ].join(" ")}>
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    className={isSelected ? "text-[#6FA89E]" : "text-[#0D1B2A]"}
                  />
                </div>
                <span className={`text-xs font-medium leading-tight ${isSelected ? "text-white" : "text-[#0D1B2A]"}`}>
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
