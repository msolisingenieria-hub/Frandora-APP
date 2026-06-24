"use client";

import { useState } from "react";
import type { PublicBusiness, BookingFormState, BookingResult } from "@/types/booking";
import { INITIAL_BOOKING_STATE } from "@/types/booking";
import { BookingHeader } from "./BookingHeader";
import { StepService } from "./steps/StepService";
import { StepStaff } from "./steps/StepStaff";
import { StepDateTime } from "./steps/StepDateTime";
import { StepClientInfo } from "./steps/StepClientInfo";
import { BookingConfirmation } from "./BookingConfirmation";
import { ChevronLeft, Sparkles } from "lucide-react";

type Props = {
  business: PublicBusiness;
};

const STEP_LABELS = ["Servicio", "Profesional", "Fecha y hora", "Tus datos"];

export function BookingPage({ business }: Props) {
  const [state, setState] = useState<BookingFormState>(INITIAL_BOOKING_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const update = (partial: Partial<BookingFormState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const goNext = () =>
    setState((prev) => ({ ...prev, step: Math.min(5, prev.step + 1) as BookingFormState["step"] }));

  const goBack = () =>
    setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) as BookingFormState["step"] }));

  const handleSubmit = async () => {
    if (!state.serviceId || !state.startTime) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId:  business.id,
          serviceId:   state.serviceId,
          staffId:     state.staffId,
          startTime:   state.startTime,
          clientName:  state.clientName,
          clientEmail: state.clientEmail,
          clientPhone: state.clientPhone,
          notes:       state.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al confirmar");
      setResult({ ...data, businessName: business.name });
      setState((prev) => ({ ...prev, step: 5 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleNewBooking = () => {
    setState(INITIAL_BOOKING_STATE);
    setResult(null);
    setError(null);
  };

  const selectedService = business.services.find((s) => s.id === state.serviceId);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      {/* Header con info del negocio */}
      <BookingHeader business={business} />

      {/* Área del wizard */}
      <div className="max-w-lg mx-auto px-0 md:px-4 pb-16">

        {/* Barra de progreso (pasos 1-4) */}
        {state.step < 5 && (
          <div className="px-4 md:px-0 pt-6 pb-2">
            {/* Steps indicator */}
            <div className="flex items-center gap-1.5 mb-3">
              {STEP_LABELS.map((label, i) => {
                const stepNum = i + 1;
                const isActive    = stepNum === state.step;
                const isCompleted = stepNum < state.step;
                return (
                  <div key={label} className="flex items-center gap-1.5 flex-1">
                    <div className={[
                      "h-1.5 rounded-full flex-1 transition-all duration-500",
                      isCompleted ? "bg-brand-teal" : isActive ? "bg-brand-navy" : "bg-slate-200",
                    ].join(" ")} />
                  </div>
                );
              })}
            </div>

            {/* Selected service summary */}
            {selectedService && state.step > 1 && (
              <div className="flex items-center gap-2 px-1">
                <Sparkles size={12} className="text-brand-teal" />
                <p className="text-xs text-slate-500 font-body truncate">
                  <span className="font-semibold text-brand-navy">{selectedService.name}</span>
                  {" · "}{selectedService.duration} min
                </p>
              </div>
            )}
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-brand border border-slate-100 overflow-hidden">

          {/* Back button */}
          {state.step > 1 && state.step < 5 && (
            <div className="px-4 pt-4">
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-slate-400 hover:text-brand-navy text-sm font-body transition-colors"
              >
                <ChevronLeft size={16} /> Volver
              </button>
            </div>
          )}

          {/* Steps */}
          {state.step === 1 && (
            <StepService
              services={business.services}
              currency={business.currency}
              state={state}
              onChange={update}
              onNext={goNext}
            />
          )}
          {state.step === 2 && (
            <StepStaff
              staff={business.staff}
              serviceId={state.serviceId!}
              state={state}
              onChange={update}
              onNext={goNext}
            />
          )}
          {state.step === 3 && (
            <StepDateTime
              businessId={business.id}
              state={state}
              onChange={update}
              onNext={goNext}
            />
          )}
          {state.step === 4 && (
            <StepClientInfo
              state={state}
              onChange={update}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
          {state.step === 5 && result && (
            <BookingConfirmation
              result={result}
              businessName={business.name}
              onNewBooking={handleNewBooking}
            />
          )}
        </div>

        {/* Powered by Frandora */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <p className="text-slate-300 text-xs font-body">Reservas gestionadas por</p>
          <span className="text-brand-teal text-xs font-sans font-bold">Frandora</span>
        </div>
      </div>
    </div>
  );
}
