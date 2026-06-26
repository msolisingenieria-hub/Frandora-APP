"use client";

import Image from "next/image";
import type { PublicStaff, BookingFormState } from "@/types/booking";
import { Users, ChevronRight, CheckCircle } from "lucide-react";

type Props = {
  staff: PublicStaff[];
  serviceId: string;
  state: BookingFormState;
  onChange: (partial: Partial<BookingFormState>) => void;
  onNext: () => void;
};

export function StepStaff({ staff, serviceId, state, onChange, onNext }: Props) {
  // Solo mostrar staff que puede hacer el servicio seleccionado
  const eligible = staff.filter((m) => m.serviceIds.includes(serviceId));

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

      <div className="space-y-2">
        {/* Opción "Cualquier profesional" */}
        <button
          onClick={() => handleSelect(null)}
          className={[
            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200",
            state.staffId === null && state.step > 2
              ? "border-brand-navy bg-brand-navy/5"
              : "border-slate-100 bg-white hover:border-brand-navy/30 hover:bg-slate-50",
          ].join(" ")}
        >
          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #162d43)" }}>
            <Users size={20} className="text-brand-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-brand-navy text-sm">
              Cualquier profesional disponible
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Asignación automática según disponibilidad
            </p>
          </div>
          <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
        </button>

        {/* Staff específico */}
        {eligible.length > 0 && (
          <div>
            <p className="text-slate-400 text-xs font-sans font-semibold tracking-[0.15em] uppercase mt-4 mb-2 px-1">
              O elige un profesional
            </p>
            {eligible.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member.id)}
                className={[
                  "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 mb-2",
                  state.staffId === member.id
                    ? "border-brand-navy bg-brand-navy/5"
                    : "border-slate-100 bg-white hover:border-brand-navy/30 hover:bg-slate-50",
                ].join(" ")}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center bg-slate-100">
                  {member.avatarUrl ? (
                    <Image src={member.avatarUrl} alt={member.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-sans font-bold text-brand-navy text-lg">
                      {member.name[0]}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-brand-navy text-sm">{member.name}</p>
                  {member.bio && (
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{member.bio}</p>
                  )}
                </div>

                {state.staffId === member.id ? (
                  <CheckCircle size={18} className="text-brand-teal flex-shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
