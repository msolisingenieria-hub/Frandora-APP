"use client";

import { DURATION_OPTIONS } from "@/types/onboarding";
import type { OnboardingData, ServiceInput } from "@/types/onboarding";

type Props = {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
};

function formatPrice(value: number) {
  return value > 0 ? value.toLocaleString("es-CL") : "";
}

export function StepServices({ data, onChange }: Props) {
  const updateService = (tempId: string, fields: Partial<ServiceInput>) => {
    onChange({
      services: data.services.map((s) =>
        s.tempId === tempId ? { ...s, ...fields } : s
      ),
    });
  };

  const addService = () => {
    onChange({
      services: [
        ...data.services,
        { tempId: crypto.randomUUID(), name: "", duration: 60, price: 0 },
      ],
    });
  };

  const removeService = (tempId: string) => {
    if (data.services.length === 1) return;
    onChange({ services: data.services.filter((s) => s.tempId !== tempId) });
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-brand p-6 md:p-8">
        <p className="text-slate-500 text-sm mb-6">
          Agrega los servicios que ofreces. Puedes agregar más desde el panel luego.
        </p>

        <div className="space-y-4">
          {data.services.map((service, i) => (
            <div key={service.tempId} className="p-4 rounded-xl border border-slate-200 bg-brand-gray/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-brand-navy uppercase tracking-wide">
                  Servicio {i + 1}
                </span>
                {data.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(service.tempId)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <input
                type="text"
                value={service.name}
                onChange={(e) => updateService(service.tempId, { name: e.target.value })}
                placeholder="Ej: Corte de cabello, Manicura, Masaje 60min..."
                className="input-brand"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-slate-500">Duración</label>
                  <select
                    value={service.duration}
                    onChange={(e) => updateService(service.tempId, { duration: Number(e.target.value) })}
                    className="input-brand"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-sans text-slate-500">Precio (CLP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      value={service.price || ""}
                      onChange={(e) => updateService(service.tempId, { price: Number(e.target.value) })}
                      placeholder="15000"
                      min="0"
                      className="input-brand pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addService}
          className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-brand-navy/20 text-brand-navy/60 text-sm font-sans hover:border-brand-navy/40 hover:text-brand-navy transition-all"
        >
          + Agregar otro servicio
        </button>
      </div>
    </div>
  );
}
