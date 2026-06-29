"use client";

import { useState } from "react";
import Image from "next/image";
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
  initialServiceId?: string;
  initialStaffId?: string;
  compact?: boolean; // cuando está dentro de un drawer, oculta el header y el fondo
};

const STEP_LABELS = ["Servicio", "Profesional", "Fecha y hora", "Tus datos"];

export function BookingPage({ business, initialServiceId, initialStaffId, compact }: Props) {
  const [state, setState] = useState<BookingFormState>(() => ({
    ...INITIAL_BOOKING_STATE,
    serviceId: initialServiceId ?? null,
    staffId:   initialStaffId  ?? null,
    step:      initialServiceId ? (initialStaffId ? 3 : 2) : 1,
  }));
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
          slug:        business.slug,
          serviceId:   state.serviceId,
          staffId:     state.staffId,
          startTime:   state.startTime,
          clientName:  state.clientName,
          clientEmail: state.clientEmail,
          clientPhone: state.clientPhone,
          notes:       state.notes,
          hp:          state.hp,
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
      className={compact ? "min-h-full" : "min-h-screen"}
      style={compact ? {} : { background: "linear-gradient(180deg, #f0f4f8 0%, #f8fafc 50%, #ffffff 100%)" }}
    >
      {/* Header con info del negocio — oculto en modo compact */}
      {!compact && <BookingHeader business={business} />}

      {/* Área del wizard */}
      <div className="max-w-lg mx-auto px-0 md:px-4 pb-16">

        {/* Barra de progreso (pasos 1-4) */}
        {state.step < 5 && (
          <div className="px-4 md:px-0 pt-4 pb-2">
            <div className="flex items-center gap-1 mb-3">
              {STEP_LABELS.map((label, i) => {
                const stepNum = i + 1;
                const isActive    = stepNum === state.step;
                const isCompleted = stepNum < state.step;
                return (
                  <div key={label} className="flex items-center gap-1 flex-1">
                    <div className={[
                      "h-1 rounded-full flex-1 transition-all duration-500",
                      isCompleted ? "bg-[#6FA89E]" : isActive ? "bg-[#0D1B2A]" : "bg-slate-200",
                    ].join(" ")} />
                  </div>
                );
              })}
            </div>

            {selectedService && state.step > 1 && (
              <div className="flex items-center gap-2.5 bg-[#F2F4F6] rounded-xl p-1.5 pr-3">
                {selectedService.imageUrl ? (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    <Image src={selectedService.imageUrl} alt={selectedService.name} fill className="object-cover" sizes="32px" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-[#6FA89E]/20">
                    <Sparkles size={13} className="text-[#6FA89E]" />
                  </div>
                )}
                <p className="text-xs text-slate-600 truncate">
                  <span className="font-semibold text-[#0D1B2A]">{selectedService.name}</span>
                  <span className="text-slate-400"> · {selectedService.duration} min</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-[0_4px_32px_rgba(13,27,42,0.10)] border border-slate-100/80 overflow-hidden">

          {/* Back button */}
          {state.step > 1 && state.step < 5 && (
            <div className="px-4 pt-4">
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-slate-400 hover:text-[#0D1B2A] text-sm transition-colors"
              >
                <ChevronLeft size={16} /> Volver
              </button>
            </div>
          )}

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
              service={selectedService}
              currency={business.currency}
              onNewBooking={handleNewBooking}
            />
          )}
        </div>

        {/* Powered by Frandora */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <p className="text-slate-400 text-xs">Reservas seguras con</p>
          <span className="text-[#6FA89E] text-xs font-bold">Frandora</span>
        </div>
      </div>
    </div>
  );
}
