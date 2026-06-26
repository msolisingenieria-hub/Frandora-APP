"use client";

import { Sparkles, UserCog, AlertTriangle, Users } from "lucide-react";

type ServiceItem = { name: string; count: number; revenue: number };
type StaffItem   = { name: string; color: string; count: number; revenue: number };
type ClientData  = { newCount: number; returningCount: number; atRisk: number };

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function TopServices({ services }: { services: ServiceItem[] }) {
  const max = Math.max(...services.map(s => s.revenue), 1);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-brand-teal" />
        <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">Top servicios</p>
      </div>
      {services.length === 0 ? (
        <p className="text-sm font-body text-slate-300 py-6 text-center">Sin datos este período</p>
      ) : (
        <div className="space-y-3">
          {services.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-body text-brand-navy truncate flex-1 mr-2">{s.name}</p>
                <p className="text-xs font-sans font-semibold text-brand-navy shrink-0">
                  ${s.revenue.toLocaleString("es-CL")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Bar pct={(s.revenue / max) * 100} color="#6FA89E" />
                <span className="text-[10px] font-body text-slate-400 shrink-0">{s.count} citas</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopStaff({ staff }: { staff: StaffItem[] }) {
  const max = Math.max(...staff.map(s => s.revenue), 1);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
      <div className="flex items-center gap-2 mb-4">
        <UserCog size={14} className="text-brand-teal" />
        <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">Rendimiento del equipo</p>
      </div>
      {staff.length === 0 ? (
        <p className="text-sm font-body text-slate-300 py-6 text-center">Sin datos este período</p>
      ) : (
        <div className="space-y-3">
          {staff.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ backgroundColor: s.color }}>
                    {s.name.slice(0,1)}
                  </div>
                  <p className="text-sm font-body text-brand-navy truncate">{s.name}</p>
                </div>
                <p className="text-xs font-sans font-semibold text-brand-navy shrink-0">
                  ${s.revenue.toLocaleString("es-CL")}
                </p>
              </div>
              <div className="flex items-center gap-2 pl-7">
                <Bar pct={(s.revenue / max) * 100} color={s.color} />
                <span className="text-[10px] font-body text-slate-400 shrink-0">{s.count} citas</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ClientStats({ data }: { data: ClientData }) {
  const total = data.newCount + data.returningCount || 1;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users size={14} className="text-brand-teal" />
        <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">Clientes este período</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Nuevos",     value: data.newCount,       color: "#6FA89E" },
          { label: "Recurrentes", value: data.returningCount, color: "#0D1B2A" },
          { label: "En riesgo",  value: data.atRisk,         color: "#f87171" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center p-3 rounded-xl bg-slate-50">
            <p className="font-sans font-bold text-xl leading-none" style={{ color }}>{value}</p>
            <p className="text-[10px] font-body text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-slate-100 flex">
        <div style={{ width: `${(data.newCount/total)*100}%`, backgroundColor: "#6FA89E" }} className="h-full transition-all duration-500" />
        <div style={{ width: `${(data.returningCount/total)*100}%`, backgroundColor: "#0D1B2A" }} className="h-full transition-all duration-500" />
      </div>
      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1 text-[10px] font-body text-slate-400">
          <span className="w-2 h-2 rounded-full bg-brand-teal inline-block" />Nuevos
        </span>
        <span className="flex items-center gap-1 text-[10px] font-body text-slate-400">
          <span className="w-2 h-2 rounded-full bg-brand-navy inline-block" />Recurrentes
        </span>
      </div>
      {data.atRisk > 0 && (
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle size={13} className="text-red-400 shrink-0" />
          <p className="text-xs font-body text-red-500">
            <span className="font-semibold">{data.atRisk}</span> clientes sin visita en más de 60 días
          </p>
        </div>
      )}
    </div>
  );
}
