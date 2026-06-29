"use client";

import Image from "next/image";
import type { PublicService, BookingFormState } from "@/types/booking";
import { formatPrice, formatDuration } from "@/types/booking";
import { Clock, ChevronRight, Zap } from "lucide-react";

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
      {/* Header */}
      <div className="mb-5">
        <p className="text-[#6FA89E] text-xs font-semibold tracking-[0.15em] uppercase mb-1">
          Paso 1 de 4
        </p>
        <h2 className="text-[#0D1B2A] font-bold text-xl">¿Qué servicio necesitas?</h2>
        <p className="text-slate-400 text-sm mt-0.5">Elige y reserva al instante</p>
      </div>

      <div className="space-y-5">
        {categories.map((cat) => {
          const catServices = services.filter((s) => (s.categoryName ?? "Servicios") === cat);
          return (
            <div key={cat}>
              {categories.length > 1 && (
                <p className="text-slate-400 text-xs font-semibold tracking-[0.12em] uppercase mb-2 px-1">
                  {cat}
                </p>
              )}
              <div className="space-y-2.5">
                {catServices.map((service) => {
                  const isSelected = state.serviceId === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleSelect(service.id)}
                      className={[
                        "group w-full flex items-center gap-3.5 p-2.5 pr-4 rounded-2xl border-2 text-left",
                        "transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out active:scale-[0.98]",
                        isSelected
                          ? "border-[#0D1B2A] bg-[#0D1B2A] shadow-lg"
                          : "border-slate-100 bg-white hover:border-[#6FA89E]/50 hover:shadow-md",
                      ].join(" ")}
                    >
                      {/* Foto del servicio (o fallback de marca) */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        {service.imageUrl ? (
                          <Image
                            src={service.imageUrl}
                            alt={service.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${service.color}, ${service.color}99)`,
                            }}
                          >
                            <span className="font-bold text-white/90 text-xl">
                              {service.name[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm leading-tight ${isSelected ? "text-white" : "text-[#0D1B2A]"}`}>
                          {service.name}
                        </p>
                        {service.description && (
                          <p className={`text-xs mt-0.5 line-clamp-1 ${isSelected ? "text-white/60" : "text-slate-400"}`}>
                            {service.description}
                          </p>
                        )}
                        <span className={`flex items-center gap-1 text-xs mt-1 ${isSelected ? "text-[#6FA89E]" : "text-slate-400"}`}>
                          <Clock size={11} /> {formatDuration(service.duration)}
                        </span>
                      </div>

                      {/* Precio + flecha */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-bold text-sm tabular-nums ${isSelected ? "text-white" : "text-[#0D1B2A]"}`}>
                          {formatPrice(service.price, currency)}
                        </span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? "bg-[#6FA89E]" : "bg-slate-100 group-hover:bg-[#CFE3DF]"
                        }`}>
                          <ChevronRight size={14} className={isSelected ? "text-white" : "text-[#0D1B2A]"} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer trust line */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        <Zap size={11} className="text-[#6FA89E]" />
        <p className="text-xs text-slate-400">Confirmación instantánea</p>
      </div>
    </div>
  );
}
