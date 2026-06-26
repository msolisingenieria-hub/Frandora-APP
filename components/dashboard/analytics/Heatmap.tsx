"use client";

const DAYS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07 a 21

export function Heatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(...grid.flatMap(r => r), 1);

  function opacity(val: number) {
    if (val === 0) return 0.04;
    return 0.1 + (val / max) * 0.85;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
      <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Horas pico de demanda
      </p>
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          {/* Encabezado horas */}
          <div className="flex mb-1 ml-8">
            {HOURS.map(h => (
              <div key={h} className="flex-1 text-center text-[9px] font-body text-slate-300">
                {h}h
              </div>
            ))}
          </div>
          {/* Filas por día */}
          {DAYS.map((day, di) => (
            <div key={day} className="flex items-center mb-0.5">
              <span className="w-8 text-[10px] font-body text-slate-400 shrink-0">{day}</span>
              {HOURS.map(h => {
                const count = grid[di]?.[h] ?? 0;
                return (
                  <div key={h} className="flex-1 mx-px">
                    <div
                      title={`${day} ${h}:00 — ${count} citas`}
                      className="h-5 rounded-sm transition-opacity"
                      style={{ backgroundColor: "#0D1B2A", opacity: opacity(count) }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 ml-8">
            <span className="text-[9px] font-body text-slate-300">Bajo</span>
            {[0.1, 0.3, 0.55, 0.75, 0.95].map(o => (
              <div key={o} className="w-4 h-3 rounded-sm" style={{ backgroundColor: "#0D1B2A", opacity: o }} />
            ))}
            <span className="text-[9px] font-body text-slate-300">Alto</span>
          </div>
        </div>
      </div>
    </div>
  );
}
