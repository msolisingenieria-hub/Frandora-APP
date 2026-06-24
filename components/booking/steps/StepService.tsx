"use client";

import type { PublicService, BookingFormState } from "@/types/booking";
import { formatPrice, formatDuration } from "@/types/booking";
import { Clock, ChevronRight, Sparkles } from "lucide-react";

type Props = {
  services: PublicService[];
  currency: string;
  state: BookingFormState;
  onChange: (partial: Partial<BookingFormState>) => void;
  onNext: () => void;
};

export function StepService({ services, currency, state, onChange, onNext }: Props) {
  const categories = Array.from(new Set(services.map((s) => s.categoryName ?? "Servicios")));

  const handleSelect = (serviceId: string) => {
    onChange({ serviceId, staffId: null, date: null, startTime: null });
    onNext();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-brand-teal" />
          <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.15em] uppercase">
            Paso 1 de 4
          </p>
        </div>
        <h2 className="text-brand-navy font-sans font-bold text-xl">
          ¿Qué servicio necesitas?
        </h2>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-slate-400 text-xs font-sans font-semibold tracking-[0.15em] uppercase mb-3 px-1">
              {cat}
            </p>
            <div className="space-y-2">
              {services
                .filter((s) => (s.categoryName ?? "Servicios") === cat)
                .map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleSelect(service.id)}
                    className={[
                      "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200",
                      state.serviceId === service.id
                        ? "border-brand-navy bg-brand-navy/5"
                        : "border-slate-100 bg-white hover:border-brand-navy/30 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {/* Color indicator */}
                    <div
                      className="w-1 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: service.color }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-brand-navy text-sm leading-tight">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Clock size={11} /> {formatDuration(service.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-sans font-bold text-brand-navy text-sm">
                        {formatPrice(service.price, currency)}
                      </span>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
