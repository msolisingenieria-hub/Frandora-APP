"use client";

import Image from "next/image";
import type { PublicStaff, BookingFormState } from "@/types/booking";
import { Users, ChevronRight, CheckCircle, Sparkles } from "lucide-react";

type Props = {
  staff: PublicStaff[];
  serviceId: string;
  state: BookingFormState;
  onChange: (partial: Partial<BookingFormState>) => void;
  onNext: () => void;
};

export function StepStaff({ staff, serviceId, state, onChange, onNext }: Props) {
  // Preferimos quien ofrece el servicio; si nadie está asignado aún,
  // mostramos a todo el equipo para no dejar el paso vacío.
  const matching = staff.filter((m) => m.serviceIds.includes(serviceId));
  const eligible = matching.length > 0 ? matching : staff;

  const handleSelect = (staffId: string | null) => {
    onChange({ staffId, date: null, startTime: null });
    onNext();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={16} className="text-brand-teal" />
          <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.15em] uppercase">
            Paso 2 de 4
          </p>
        </div>
        <h2 className="text-brand-navy font-sans font-bold text-xl">
          ¿Con quién quieres reservar?
        </h2>
      </div>

      <div className="space-y-2.5">
        {/* Opción "Cualquier profesional" */}
        <button
          onClick={() => handleSelect(null)}
          className={[
            "w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 text-left",
            "transition-[transform,border-color,background-color] duration-200 ease-out active:scale-[0.98]",
            state.staffId === null && state.step > 2
              ? "border-brand-navy bg-brand-navy/5"
              : "border-slate-100 bg-white hover:border-brand-navy/30 hover:bg-slate-50",
          ].join(" ")}
        >
          <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #162d43)" }}>
            <Sparkles size={22} className="text-brand-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-brand-navy text-sm">
              Cualquier profesional disponible
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Te asignamos al primero con hora libre
            </p>
          </div>
          <ChevronRight size={16} className="text-slate-300 shrink-0" />
        </button>

        {/* Equipo */}
        {eligible.length > 0 && (
          <div>
            <p className="text-slate-400 text-xs font-sans font-semibold tracking-[0.15em] uppercase mt-4 mb-2 px-1">
              O elige un profesional
            </p>
            <div className="space-y-2.5">
              {eligible.map((member) => {
                const isSelected = state.staffId === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelect(member.id)}
                    className={[
                      "w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 text-left",
                      "transition-[transform,border-color,background-color] duration-200 ease-out active:scale-[0.98]",
                      isSelected
                        ? "border-brand-navy bg-brand-navy/5"
                        : "border-slate-100 bg-white hover:border-brand-navy/30 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {/* Avatar grande */}
                    <div className="relative w-14 h-14 rounded-2xl shrink-0 overflow-hidden bg-brand-mist flex items-center justify-center">
                      {member.avatarUrl ? (
                        <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" sizes="56px" />
                      ) : (
                        <span className="font-sans font-bold text-brand-navy text-xl">
                          {member.name[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-brand-navy text-sm">{member.name}</p>

                      {member.specialties.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.specialties.slice(0, 2).map((sp) => (
                            <span key={sp} className="px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-brand-mist text-brand-navy">
                              {sp}
                            </span>
                          ))}
                        </div>
                      ) : member.bio ? (
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{member.bio}</p>
                      ) : null}
                    </div>

                    {isSelected ? (
                      <CheckCircle size={18} className="text-brand-teal shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
