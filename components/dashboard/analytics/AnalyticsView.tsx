"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Calendar } from "lucide-react";
import { StatsCards } from "./StatsCards";
import { RevenueChart } from "./RevenueChart";
import { TopServices, TopStaff, ClientStats } from "./TopLists";
import { Heatmap } from "./Heatmap";

type Period = "month" | "week" | "quarter";

function periodDates(p: Period) {
  const now = new Date();
  if (p === "week") {
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    from.setHours(0,0,0,0);
    return { from, to: now };
  }
  if (p === "quarter") {
    const from = new Date(now);
    from.setMonth(now.getMonth() - 2, 1);
    from.setHours(0,0,0,0);
    return { from, to: now };
  }
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
}

const PERIOD_LABELS: Record<Period, string> = {
  week:    "Esta semana",
  month:   "Este mes",
  quarter: "Últimos 3 meses",
};

export function AnalyticsView() {
  const [period,    setPeriod]    = useState<Period>("month");
  const [overview,  setOverview]  = useState<Record<string, number> | null>(null);
  const [revenue,   setRevenue]   = useState<{ daily: {date:string;revenue:number}[]; services: {name:string;count:number;revenue:number}[]; staff: {name:string;color:string;count:number;revenue:number}[] } | null>(null);
  const [clientData, setClientData] = useState<{ clients: {newCount:number;returningCount:number;atRisk:number}; heatmap: number[][] } | null>(null);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async (p: Period) => {
    setLoading(true);
    const { from, to } = periodDates(p);
    const qs = `from=${from.toISOString()}&to=${to.toISOString()}`;

    const [ov, rev, cli] = await Promise.all([
      fetch("/api/analytics/overview").then(r => r.json()),
      fetch(`/api/analytics/revenue?${qs}`).then(r => r.json()),
      fetch(`/api/analytics/clients?${qs}`).then(r => r.json()),
    ]);
    setOverview(ov);
    setRevenue(rev);
    setClientData(cli);
    setLoading(false);
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  function handleExport() {
    const { from, to } = periodDates(period);
    window.open(`/api/analytics/export?from=${from.toISOString()}&to=${to.toISOString()}`, "_blank");
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-brand-navy font-sans font-bold text-xl md:text-2xl">Reportes</h1>
          <p className="text-slate-400 text-sm font-body mt-0.5">Datos en tiempo real de tu negocio</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de período */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
            {(["week","month","quarter"] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-2 text-xs font-sans font-semibold transition-colors flex items-center gap-1 ${
                  period === p ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50"
                }`}>
                <Calendar size={11} />
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-sans font-semibold text-slate-500 hover:bg-slate-50 transition-colors bg-white">
            <Download size={13} /> Exportar CSV
          </button>
          <button onClick={() => load(period)} title="Actualizar"
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors bg-white">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading || !overview ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0,1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[0,1,2,3].map(i => <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      ) : (
        <>
          <StatsCards stats={overview as Parameters<typeof StatsCards>[0]["stats"]} />

          {revenue && (
            <RevenueChart
              data={revenue.daily}
              total={revenue.daily.reduce((s, d) => s + d.revenue, 0)}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {revenue && <TopServices services={revenue.services} />}
            {revenue && <TopStaff staff={revenue.staff} />}
            {clientData && <ClientStats data={clientData.clients} />}
            {clientData && <Heatmap grid={clientData.heatmap} />}
          </div>
        </>
      )}
    </div>
  );
}
