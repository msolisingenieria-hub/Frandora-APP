"use client";

import type { OnboardingData, DaySchedule } from "@/types/onboarding";

type Props = {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
};

const DAYS = [
  { day: 1, label: "Lunes",     short: "L" },
  { day: 2, label: "Martes",    short: "M" },
  { day: 3, label: "Miércoles", short: "X" },
  { day: 4, label: "Jueves",    short: "J" },
  { day: 5, label: "Viernes",   short: "V" },
  { day: 6, label: "Sábado",    short: "S" },
  { day: 0, label: "Domingo",   short: "D" },
];

const TIME_OPTIONS = Array.from({ length: 29 }, (_, i) => {
  const totalHalf = i + 12; // 06:00 → 22:00
  const hour = Math.floor(totalHalf / 2);
  const min = totalHalf % 2 === 0 ? "00" : "30";
  const val = `${String(hour).padStart(2, "0")}:${min}`;
  return val;
});

export function StepHours({ data, onChange }: Props) {
  const updateDay = (dayNum: number, fields: Partial<DaySchedule>) => {
    onChange({
      schedule: {
        ...data.schedule,
        [dayNum]: { ...data.schedule[dayNum], ...fields },
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-brand p-6 md:p-8">
      <p className="text-slate-500 text-sm mb-6">
        Configura el horario de atención de tu negocio. Puedes personalizarlo por profesional luego.
      </p>

      <div className="space-y-3">
        {DAYS.map(({ day, label }) => {
          const sched = data.schedule[day];
          return (
            <div
              key={day}
              className={[
                "flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                sched.isOpen ? "border-brand-navy/20 bg-white" : "border-slate-200 bg-slate-50",
              ].join(" ")}
            >
              {/* Toggle + día */}
              <div className="flex items-center gap-3 sm:w-32">
                <button
                  type="button"
                  role="switch"
                  aria-checked={sched.isOpen}
                  onClick={() => updateDay(day, { isOpen: !sched.isOpen })}
                  className={[
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 flex-shrink-0",
                    sched.isOpen ? "bg-brand-navy" : "bg-slate-300",
                  ].join(" ")}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${sched.isOpen ? "translate-x-4" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm font-sans font-medium ${sched.isOpen ? "text-brand-navy" : "text-slate-400"}`}>
                  {label}
                </span>
              </div>

              {/* Horarios */}
              {sched.isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={sched.openTime}
                    onChange={(e) => updateDay(day, { openTime: e.target.value })}
                    className="input-brand text-sm py-2 flex-1"
                  >
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-slate-400 text-sm flex-shrink-0">a</span>
                  <select
                    value={sched.closeTime}
                    onChange={(e) => updateDay(day, { closeTime: e.target.value })}
                    className="input-brand text-sm py-2 flex-1"
                  >
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              ) : (
                <span className="text-sm text-slate-400 italic">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
