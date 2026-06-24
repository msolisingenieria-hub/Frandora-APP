import Link from "next/link";
import { FrandoraLogo } from "@/components/ui/FrandoraLogo";

type Step = { title: string; description: string };

type Props = {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
};

export function OnboardingProgress({ currentStep, totalSteps, steps }: Props) {
  const current = steps[currentStep - 1];

  return (
    <div className="bg-brand-navy px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <Link href="/"><FrandoraLogo size="sm" variant="light" /></Link>
        </div>

        {/* Step info */}
        <div className="mb-5">
          <p className="text-brand-teal text-xs tracking-[0.2em] uppercase font-sans mb-1">
            Paso {currentStep} de {totalSteps}
          </p>
          <h1 className="text-white font-sans font-semibold text-xl">{current.title}</h1>
          <p className="text-white/55 text-sm mt-0.5">{current.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={[
                    "rounded-full transition-all duration-300 flex items-center justify-center text-xs font-sans font-semibold",
                    isDone
                      ? "w-6 h-6 bg-brand-teal text-white"
                      : isActive
                      ? "w-8 h-8 bg-white text-brand-navy"
                      : "w-6 h-6 bg-white/15 text-white/40",
                  ].join(" ")}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px flex-1 min-w-[24px] transition-all duration-300 ${isDone ? "bg-brand-teal" : "bg-white/15"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
