"use client";

import type { BookingFormState } from "@/types/booking";
import { User, Mail, Phone, MessageSquare, Loader2 } from "lucide-react";

type Props = {
  state: BookingFormState;
  onChange: (partial: Partial<BookingFormState>) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

export function StepClientInfo({ state, onChange, onSubmit, loading, error }: Props) {
  const canSubmit =
    state.clientName.trim().length >= 2 &&
    state.clientEmail.includes("@") &&
    state.clientPhone.length >= 8 &&
    !loading;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-brand-teal" />
          <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.15em] uppercase">
            Paso 4 de 4
          </p>
        </div>
        <h2 className="text-brand-navy font-sans font-bold text-xl">
          Tus datos de contacto
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Recibirás la confirmación en tu email.
        </p>
      </div>

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="text-brand-navy text-xs font-sans font-semibold mb-1.5 flex items-center gap-1.5">
            <User size={12} /> Nombre completo *
          </label>
          <input
            type="text"
            placeholder="Tu nombre y apellido"
            value={state.clientName}
            onChange={(e) => onChange({ clientName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-brand-navy font-body text-sm placeholder:text-slate-300 focus:outline-none focus:border-brand-navy transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-brand-navy text-xs font-sans font-semibold mb-1.5 flex items-center gap-1.5">
            <Mail size={12} /> Email *
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={state.clientEmail}
            onChange={(e) => onChange({ clientEmail: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-brand-navy font-body text-sm placeholder:text-slate-300 focus:outline-none focus:border-brand-navy transition-colors"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="text-brand-navy text-xs font-sans font-semibold mb-1.5 flex items-center gap-1.5">
            <Phone size={12} /> Teléfono *
          </label>
          <input
            type="tel"
            placeholder="+56 9 1234 5678"
            value={state.clientPhone}
            onChange={(e) => onChange({ clientPhone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-brand-navy font-body text-sm placeholder:text-slate-300 focus:outline-none focus:border-brand-navy transition-colors"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="text-brand-navy text-xs font-sans font-semibold mb-1.5 flex items-center gap-1.5">
            <MessageSquare size={12} /> Notas (opcional)
          </label>
          <textarea
            placeholder="Alergias, preferencias, notas..."
            value={state.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-brand-navy font-body text-sm placeholder:text-slate-300 focus:outline-none focus:border-brand-navy transition-colors resize-none"
          />
        </div>

        {/* Honeypot anti-bot — invisible para humanos, los bots lo rellenan */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
          <label htmlFor="website-url">No completar este campo</label>
          <input
            id="website-url"
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            value={state.hp}
            onChange={(e) => onChange({ hp: e.target.value })}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl font-sans font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={canSubmit ? { background: "linear-gradient(135deg, #0D1B2A, #1a3347)" } : { backgroundColor: "#94a3b8" }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Confirmando reserva...</>
          ) : (
            "Confirmar reserva"
          )}
        </button>
      </div>
    </div>
  );
}
