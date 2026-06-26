"use client";

import { TrendingUp, TrendingDown, CalendarDays, Users, DollarSign, XCircle } from "lucide-react";

type Stats = {
  todayAppts: number; monthAppts: number; apptGrowth: number;
  monthRevenue: number; avgTicket: number;
  totalClients: number; newClients: number; cancelRate: number;
};

function KpiCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} pointer-events-none`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} border border-white shadow-sm`}>
            <Icon size={16} className="text-brand-navy" />
          </div>
          {trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-[11px] font-sans font-semibold ${trend >= 0 ? "text-emerald-500" : "text-red-400"}`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(Math.round(trend))}%
            </span>
          )}
        </div>
        <p className="text-brand-navy font-sans font-bold text-2xl leading-none">{value}</p>
        <p className="text-slate-400 text-xs font-body mt-1">{label}</p>
        {sub && <p className="text-slate-300 text-[10px] font-body mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Citas este mes"
        value={String(stats.monthAppts)}
        sub={`${stats.todayAppts} hoy`}
        icon={CalendarDays}
        color="from-brand-navy/8 to-brand-navy/3"
        trend={stats.apptGrowth}
      />
      <KpiCard
        label="Ingresos del mes"
        value={`$${stats.monthRevenue.toLocaleString("es-CL")}`}
        sub={`Ticket prom. $${Math.round(stats.avgTicket).toLocaleString("es-CL")}`}
        icon={DollarSign}
        color="from-emerald-500/10 to-emerald-500/4"
      />
      <KpiCard
        label="Clientes totales"
        value={String(stats.totalClients)}
        sub={`+${stats.newClients} nuevos este mes`}
        icon={Users}
        color="from-brand-teal/10 to-brand-teal/4"
      />
      <KpiCard
        label="Tasa de cancelación"
        value={`${Math.round(stats.cancelRate)}%`}
        sub="Citas canceladas vs total"
        icon={XCircle}
        color="from-red-400/8 to-red-400/3"
      />
    </div>
  );
}
