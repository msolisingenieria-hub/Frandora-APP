"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "./OnboardingProgress";
import { StepCategory } from "./steps/StepCategory";
import { StepBusiness } from "./steps/StepBusiness";
import { StepServices } from "./steps/StepServices";
import { StepHours } from "./steps/StepHours";
import { StepPlan } from "./steps/StepPlan";
import type { OnboardingData } from "@/types/onboarding";
import { DEFAULT_SCHEDULE } from "@/types/onboarding";

const STEPS = [
  { title: "Tipo de negocio",  description: "¿Qué tipo de negocio tienes?" },
  { title: "Datos del negocio", description: "Información que verán tus clientes" },
  { title: "Tus servicios",    description: "¿Qué servicios ofreces?" },
  { title: "Horario de atención", description: "¿Cuándo estás disponible?" },
  { title: "Elige tu plan",    description: "Empieza gratis, sin tarjeta de crédito" },
];

const INITIAL_DATA: OnboardingData = {
  category: "",
  categoryLabel: "",
  businessName: "",
  phone: "",
  address: "",
  city: "",
  description: "",
  services: [{ tempId: "default", name: "", duration: 60, price: 0 }],
  schedule: DEFAULT_SCHEDULE,
  planTier: "PROFESSIONAL",
  isAnnual: false,
};

function isStepValid(step: number, data: OnboardingData): boolean {
  if (step === 1) return !!data.category && (data.category !== "OTHER" || !!data.categoryCustomLabel?.trim());
  if (step === 2) return !!(data.businessName.trim() && data.phone.trim() && data.city.trim());
  if (step === 3) return data.services.some((s) => s.name.trim() && s.price > 0);
  return true;
}

export function OnboardingWizard() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (partial: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          clerkId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress ?? "",
          name: user?.fullName ?? user?.firstName ?? "Usuario",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Error al crear el negocio");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setIsSubmitting(false);
    }
  };

  const canAdvance = isStepValid(step, data);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-navy/4 to-white">
      <OnboardingProgress currentStep={step} totalSteps={5} steps={STEPS} />

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {step === 1 && <StepCategory data={data} onChange={update} />}
          {step === 2 && <StepBusiness data={data} onChange={update} />}
          {step === 3 && <StepServices data={data} onChange={update} />}
          {step === 4 && <StepHours data={data} onChange={update} />}
          {step === 5 && <StepPlan data={data} onChange={update} />}

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="btn-brand-outline"
              >
                ← Atrás
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="btn-brand"
              >
                Continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-brand"
              >
                {isSubmitting ? "Creando tu negocio..." : "¡Crear mi negocio gratis!"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
