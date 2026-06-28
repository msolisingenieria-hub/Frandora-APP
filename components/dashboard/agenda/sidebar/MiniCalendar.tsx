"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, addMonths, subMonths, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  selectedDate:     Date;
  onChange:         (date: Date) => void;
  appointmentDates?: Date[];
}

const DOW = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

export function MiniCalendar({ selectedDate, onChange, appointmentDates = [] }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate));

  const start   = startOfMonth(viewMonth);
  const end     = endOfMonth(viewMonth);
  const days    = eachDayOfInterval({ start, end });

  // Pad inicio (Lunes = 0)
  const firstDow = (getDay(start) + 6) % 7; // convert Sun-first to Mon-first
  const padded   = Array(firstDow).fill(null).concat(days);
  // Pad fin hasta múltiplo de 7
  while (padded.length % 7 !== 0) padded.push(null);

  const hasAppt = (d: Date) => appointmentDates.some((a) => isSameDay(a, d));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-3">
      {/* Header mes */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-brand-navy transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-sans font-semibold text-brand-navy capitalize">
          {format(viewMonth, "MMMM yyyy", { locale: es })}
        </span>
        <button onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-brand-navy transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Cabecera días */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-center text-[9px] font-sans font-semibold text-slate-400 uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {padded.map((day, i) => {
          if (!day) return <div key={i} />;
          const selected  = isSameDay(day, selectedDate);
          const today     = isToday(day);
          const sameMonth = isSameMonth(day, viewMonth);
          const appt      = hasAppt(day);
          return (
            <button
              key={i}
              onClick={() => { onChange(day); setViewMonth(day); }}
              className={[
                "relative flex flex-col items-center justify-center w-7 h-7 mx-auto rounded-lg text-[11px] font-sans transition-all duration-100",
                selected  ? "bg-brand-navy text-white font-bold" : "",
                !selected && today ? "border border-brand-teal text-brand-teal font-semibold" : "",
                !selected && !today && sameMonth ? "text-slate-700 hover:bg-slate-100" : "",
                !selected && !today && !sameMonth ? "text-slate-300" : "",
              ].filter(Boolean).join(" ")}
            >
              {format(day, "d")}
              {appt && !selected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-teal" />
              )}
            </button>
          );
        })}
      </div>

      {/* Botón hoy */}
      <button
        onClick={() => { const t = new Date(); onChange(t); setViewMonth(t); }}
        className="mt-3 w-full text-[10px] font-sans font-semibold text-brand-teal hover:text-brand-navy transition-colors py-1 rounded-lg hover:bg-slate-50"
      >
        Hoy
      </button>
    </div>
  );
}
