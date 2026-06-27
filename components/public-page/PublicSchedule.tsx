import type { PublicDaySchedule } from "@/types/public-page";
import { DAY_NAMES } from "@/types/booking";

type Props = {
  schedule: PublicDaySchedule[];
};

function isOpenNow(schedule: PublicDaySchedule[]): boolean {
  const now = new Date();
  const dow = now.getDay();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const today = schedule.find((s) => s.dayOfWeek === dow);
  if (!today || today.isClosed) return false;
  return timeStr >= today.openTime && timeStr < today.closeTime;
}

export function PublicSchedule({ schedule }: Props) {
  if (schedule.length === 0) return null;

  const open = isOpenNow(schedule);
  const today = new Date().getDay();

  return (
    <section id="horarios" className="px-4 md:px-10 py-8 md:py-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-sans font-bold text-brand-navy text-xl md:text-2xl">Horarios</h2>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans font-semibold ${
          open ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-emerald-500" : "bg-slate-400"}`} />
          {open ? "Abierto ahora" : "Cerrado ahora"}
        </span>
      </div>

      <div className="max-w-sm bg-white rounded-2xl border border-slate-100 shadow-brand-sm overflow-hidden">
        {schedule.map((day) => {
          const isToday = day.dayOfWeek === today;
          return (
            <div
              key={day.dayOfWeek}
              className={`flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0 ${
                isToday ? "bg-brand-mist/40" : ""
              }`}
            >
              <span className={`font-body text-sm ${
                isToday ? "font-semibold text-brand-navy" : "text-slate-600"
              }`}>
                {DAY_NAMES[day.dayOfWeek]}
              </span>
              {day.isClosed ? (
                <span className="font-body text-sm text-slate-400">Cerrado</span>
              ) : (
                <span className={`font-body text-sm ${isToday ? "font-semibold text-brand-navy" : "text-slate-600"}`}>
                  {day.openTime} – {day.closeTime}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
