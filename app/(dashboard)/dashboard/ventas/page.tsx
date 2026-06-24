"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, TrendingUp, CreditCard, Banknote, Smartphone } from "lucide-react";
import { POSTerminal } from "@/components/dashboard/pos/POSTerminal";

type DailySummary = {
  total: number;
  count: number;
  tips: number;
  discounts: number;
  byMethod: Record<string, number>;
};

const METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo", CARD: "Tarjeta", TRANSFER: "Transferencia",
  QR: "QR/Billetera", ONLINE: "Online", MIXED: "Mixto",
};
const METHOD_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote, CARD: CreditCard, TRANSFER: Smartphone,
  QR: Smartphone, ONLINE: CreditCard, MIXED: CreditCard,
};

export default function VentasPage() {
  const [tab, setTab] = useState<"pos" | "resumen">("pos");
  const [summary, setSummary] = useState<DailySummary | null>(null);

  useEffect(() => {
    if (tab === "resumen") {
      fetch("/api/pos").then((r) => r.json()).then(setSummary);
    }
  }, [tab]);

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShoppingBag size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">POS</p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
            Ventas & Punto de Venta
          </h1>
        </div>
        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {(["pos", "resumen"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={[
                "px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-all",
                tab === t ? "bg-white text-brand-navy shadow-brand-sm" : "text-slate-500 hover:text-brand-navy",
              ].join(" ")}>
              {t === "pos" ? "Terminal" : "Resumen del día"}
            </button>
          ))}
        </div>
      </div>

      {tab === "pos" && <POSTerminal />}

      {tab === "resumen" && summary && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total del día", value: `$${summary.total.toLocaleString("es-CL")}`, icon: TrendingUp, color: "text-emerald-500" },
              { label: "Transacciones", value: String(summary.count), icon: ShoppingBag, color: "text-brand-navy" },
              { label: "Propinas", value: `$${summary.tips.toLocaleString("es-CL")}`, icon: CreditCard, color: "text-brand-teal" },
              { label: "Descuentos", value: `$${summary.discounts.toLocaleString("es-CL")}`, icon: Banknote, color: "text-amber-500" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
                  <Icon size={18} className={`${stat.color} mb-3`} />
                  <p className="text-brand-navy font-sans font-bold text-xl">{stat.value}</p>
                  <p className="text-slate-400 text-xs font-body mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* By payment method */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6">
            <h2 className="text-brand-navy font-sans font-semibold text-base mb-4">Por método de pago</h2>
            <div className="space-y-3">
              {Object.entries(summary.byMethod).length === 0 ? (
                <p className="text-slate-400 text-sm font-body">Sin ventas hoy</p>
              ) : (
                Object.entries(summary.byMethod).map(([method, amount]) => {
                  const Icon = METHOD_ICONS[method] ?? CreditCard;
                  const pct = summary.total > 0 ? (amount / summary.total) * 100 : 0;
                  return (
                    <div key={method}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className="text-slate-400" />
                          <span className="text-sm font-body text-brand-navy">{METHOD_LABELS[method] ?? method}</span>
                        </div>
                        <span className="text-sm font-sans font-semibold text-brand-navy">
                          ${amount.toLocaleString("es-CL")}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0D1B2A, #6FA89E)" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
