"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type DayRevenue = { date: string; revenue: number };

type Props = { data: DayRevenue[]; total: number };

function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-brand px-4 py-3">
      <p className="text-[11px] font-body text-slate-400 mb-0.5">
        {format(parseISO(label), "d 'de' MMMM", { locale: es })}
      </p>
      <p className="text-brand-navy font-sans font-bold text-sm">
        ${payload[0].value.toLocaleString("es-CL")}
      </p>
    </div>
  );
}

export function RevenueChart({ data, total }: Props) {
  const hasData = data.some(d => d.revenue > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Ingresos diarios</p>
          <p className="text-brand-navy font-sans font-bold text-xl">${total.toLocaleString("es-CL")}</p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-slate-300 text-sm font-body">
          Sin ingresos en este período
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rev-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0D1B2A" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0D1B2A" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={d => format(parseISO(d), "d", { locale: es })}
                tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "Inter" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "Inter" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="revenue"
                stroke="#0D1B2A" strokeWidth={2}
                fill="url(#rev-gradient)"
                dot={false} activeDot={{ r: 4, fill: "#6FA89E", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
