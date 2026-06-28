"use client";

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

// Servicios sugeridos según categoría para pre-rellenar el paso siguiente
export const SUGGESTED_SERVICES: Record<string, { name: string; duration: number; price: number }[]> = {
  BARBERSHOP:       [{ name: "Corte de cabello", duration: 30, price: 8000 }, { name: "Corte + barba", duration: 45, price: 12000 }, { name: "Afeitado clásico", duration: 30, price: 6000 }],
  HAIR_SALON:       [{ name: "Corte de mujer", duration: 60, price: 15000 }, { name: "Tinte completo", duration: 120, price: 35000 }, { name: "Peinado", duration: 45, price: 10000 }],
  BEAUTY_SALON:     [{ name: "Maquillaje social", duration: 60, price: 20000 }, { name: "Depilación facial", duration: 30, price: 8000 }, { name: "Cejas", duration: 20, price: 5000 }],
  SPA:              [{ name: "Masaje relajante", duration: 60, price: 25000 }, { name: "Facial hidratante", duration: 45, price: 20000 }, { name: "Aromaterapia", duration: 60, price: 22000 }],
  NAIL_SALON:       [{ name: "Manicura clásica", duration: 45, price: 8000 }, { name: "Pedicura", duration: 60, price: 10000 }, { name: "Uñas acrílicas", duration: 90, price: 18000 }],
  MASSAGE:          [{ name: "Masaje deportivo", duration: 60, price: 22000 }, { name: "Masaje descontracturante", duration: 60, price: 25000 }, { name: "Reflexología", duration: 45, price: 18000 }],
  AESTHETIC_CLINIC: [{ name: "Limpieza facial", duration: 60, price: 25000 }, { name: "Radiofrecuencia", duration: 60, price: 35000 }, { name: "Peeling químico", duration: 45, price: 30000 }],
  DENTAL:           [{ name: "Limpieza dental", duration: 60, price: 30000 }, { name: "Blanqueamiento", duration: 90, price: 80000 }, { name: "Consulta", duration: 30, price: 15000 }],
  PHYSIOTHERAPY:    [{ name: "Sesión kinesiología", duration: 45, price: 20000 }, { name: "Evaluación postural", duration: 60, price: 25000 }, { name: "Ultrasonido", duration: 30, price: 15000 }],
  PSYCHOLOGY:       [{ name: "Sesión individual", duration: 50, price: 35000 }, { name: "Evaluación inicial", duration: 60, price: 40000 }, { name: "Sesión de pareja", duration: 60, price: 50000 }],
  NUTRITION:        [{ name: "Consulta nutricional", duration: 60, price: 25000 }, { name: "Control mensual", duration: 30, price: 15000 }, { name: "Plan alimentario", duration: 45, price: 20000 }],
  FITNESS_GYM:      [{ name: "Clase grupal", duration: 60, price: 5000 }, { name: "Entrenamiento personal", duration: 60, price: 20000 }, { name: "Evaluación física", duration: 60, price: 15000 }],
  YOGA_PILATES:     [{ name: "Clase de yoga", duration: 60, price: 8000 }, { name: "Pilates mat", duration: 60, price: 8000 }, { name: "Clase privada", duration: 60, price: 20000 }],
  TATTOO:           [{ name: "Tatuaje pequeño", duration: 120, price: 30000 }, { name: "Tatuaje mediano", duration: 180, price: 60000 }, { name: "Consulta de diseño", duration: 30, price: 0 }],
  VETERINARY:       [{ name: "Consulta veterinaria", duration: 30, price: 15000 }, { name: "Vacunación", duration: 20, price: 12000 }, { name: "Baño y corte", duration: 90, price: 20000 }],
  COACHING:         [{ name: "Sesión de coaching", duration: 60, price: 40000 }, { name: "Sesión inicial", duration: 90, price: 50000 }, { name: "Sesión grupal", duration: 90, price: 20000 }],
  OTHER:            [{ name: "Servicio principal", duration: 60, price: 15000 }],
};

type Props = {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
};

export function StepCategory({ data, onChange }: Props) {
  const handleSelect = (catId: string, catLabel: string) => {
    const suggested = SUGGESTED_SERVICES[catId] ?? SUGGESTED_SERVICES.OTHER;
    onChange({
      category: catId,
      categoryLabel: catLabel,
      categoryCustomLabel: catId === "OTHER" ? data.categoryCustomLabel : undefined,
      // Pre-rellenar servicios sugeridos si el usuario no tiene ninguno propio aún
      services: suggested.map((s) => ({ ...s, tempId: crypto.randomUUID() })),
    });
  };

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
                onClick={() => handleSelect(cat.id, cat.label)}
                className={[
                  "group flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6FA89E]",
                  isSelected
                    ? "border-[#0D1B2A] bg-[#0D1B2A] text-white shadow-lg scale-[1.02]"
                    : "border-slate-200 bg-white text-[#0D1B2A] hover:border-[#6FA89E] hover:shadow-md hover:scale-[1.01]",
                ].join(" ")}
              >
                <div className={[
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isSelected ? "bg-white/15" : "bg-[#F2F4F6] group-hover:bg-[#CFE3DF]",
                ].join(" ")}>
                  <Icon size={20} strokeWidth={1.75} className={isSelected ? "text-[#6FA89E]" : "text-[#0D1B2A]"} />
                </div>
                <span className={`text-xs font-medium leading-tight ${isSelected ? "text-white" : "text-[#0D1B2A]"}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Campo de texto cuando selecciona "Otro" */}
        {data.category === "OTHER" && (
          <div className="mt-5 animate-fade-in">
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              ¿Qué tipo de negocio tienes? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={data.categoryCustomLabel ?? ""}
              onChange={(e) => onChange({ categoryCustomLabel: e.target.value })}
              placeholder="Ej: Centro de estética, Escuela de baile, Fotografía..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-body text-slate-800 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#6FA89E] focus:bg-white focus:ring-2 focus:ring-[#6FA89E]/20"
            />
            <p className="mt-1 text-xs text-slate-400">
              Esto nos ayuda a personalizar tu experiencia y sugerir servicios relevantes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
