"use client";

import { useState, useEffect, useCallback } from "react";
import type { BookingFormState } from "@/types/booking";
import type { SlotResult } from "@/lib/services/slots.service";
import { DAY_NAMES_SHORT, MONTH_NAMES } from "@/types/booking";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import {
  addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, format, isSameDay, isBefore, startOfDay, addDays,
} from "date-fns";

type Props = {
  businessId: string;
  state: BookingFormState;
  onChange: (partial: Partial<BookingFormState>) => void;
  onNext: () => void;
};

export function StepDateTime({ businessId, state, onChange, onNext }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [slots, setSlots] = useState<SlotResult[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchSlots = useCallback(async (date: Date) => {
    if (!state.serviceId) return;
    setLoadingSlots(true);
    try {
      const params = new URLSearchParams({
        businessId,
        serviceId: state.serviceId,
        date: format(date, "yyyy-MM-dd"),
        ...(state.staffId ? { staffId: state.staffId } : {}),
      });
      const res = await fetch(`/api/slots?${params}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [businessId, state.serviceId, state.staffId]);

  useEffect(() => {
    if (state.date) fetchSlots(state.date);
  }, [state.date, fetchSlots]);

  // Construir grid del mes
  const monthStart = startOfMonth(viewMonth);
  const monthEnd   = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayIndex = (getDay(monthStart) + 6) % 7; // Lunes=0
  const today = startOfDay(new Date());

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;
    onChange({ date: day, startTime: null });
  };

  const handleTimeClick = (time: string) => {
    onChange({ startTime: time });
    onNext();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays size={16} className="text-brand-teal" />
          <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.15em] uppercase">
            Paso 3 de 4
          </p>
        </div>
        <h2 className="text-brand-navy font-sans font-bold text-xl">
          Elige fecha y horario
        </h2>
      </div>

      {/* ── Calendario ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm">
        {/* Header del mes */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft size={16} className="text-brand-navy" />
          </button>
          <p className="font-sans font-semibold text-brand-navy text-sm">
            {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </p>
          <button onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronRight size={16} className="text-brand-navy" />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES_SHORT.map((d, i) => (
            <div key={i} className="text-center text-xs font-sans font-semibold text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const isPast     = isBefore(day, today);
            const isSelected = state.date ? isSameDay(day, state.date) : false;
            const isToday    = isSameDay(day, today);
            return (
              <button
                key={day.toISOString()}
                disabled={isPast}
                onClick={() => handleDayClick(day)}
                className={[
                  "mx-auto w-9 h-9 rounded-xl text-xs font-sans font-medium transition-all duration-200",
                  isSelected ? "bg-brand-navy text-white shadow-brand-sm" : "",
                  isToday && !isSelected ? "ring-2 ring-brand-teal text-brand-navy" : "",
                  !isSelected && !isPast ? "hover:bg-slate-100 text-brand-navy" : "",
                  isPast ? "text-slate-300 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Horarios ── */}
      {state.date && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-brand-teal" />
            <p className="text-slate-500 text-sm font-body">
              Horarios disponibles para el {format(state.date, "d 'de' MMMM")}
            </p>
          </div>

          {loadingSlots ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No hay horarios disponibles para esta fecha.</p>
              <p className="text-slate-400 text-xs mt-1">Prueba con otro día.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleTimeClick(slot.time)}
                  className={[
                    "py-2.5 rounded-xl text-sm font-sans font-medium transition-all duration-200",
                    state.startTime === slot.time
                      ? "bg-brand-navy text-white shadow-brand-sm"
                      : "bg-slate-50 border border-slate-200 text-brand-navy hover:border-brand-navy hover:bg-brand-navy/5",
                  ].join(" ")}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
