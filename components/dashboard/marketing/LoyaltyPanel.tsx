"use client";

import { useState, useEffect, useCallback } from "react";
import { Award, ToggleLeft, ToggleRight, Info, Check } from "lucide-react";

type Config = {
  enabled: boolean;
  pointsPerBooking: number;
  pointsPerPurchase: number;
  pointValue: number;
};

export function LoyaltyPanel() {
  const [config, setConfig] = useState<Config>({
    enabled: false, pointsPerBooking: 10,
    pointsPerPurchase: 1, pointValue: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/loyalty");
    if (res.ok) setConfig(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/loyalty", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />;

  const exampleDiscount = Math.floor(config.pointsPerBooking * 10 / config.pointValue);

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm font-body">
        Premia a tus clientes por volver. Ganan puntos en cada cita y los canjean como descuento.
      </p>

      {/* Activar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <Award size={18} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-brand-navy font-sans font-semibold text-sm">Programa de puntos</p>
          <p className="text-slate-400 text-xs font-body mt-0.5">
            {config.enabled ? "Activo — tus clientes están acumulando puntos" : "Inactivo — actívalo para empezar"}
          </p>
        </div>
        <button onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}>
          {config.enabled
            ? <ToggleRight size={28} className="text-emerald-500" />
            : <ToggleLeft size={28} className="text-slate-300" />}
        </button>
      </div>

      {config.enabled && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6 space-y-5">
          <h3 className="text-brand-navy font-sans font-semibold text-sm">Configurar puntos</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-body text-slate-500 mb-1.5 block">Puntos por cada reserva completada</label>
              <input type="number" min="1" max="1000" value={config.pointsPerBooking}
                onChange={e => setConfig(c => ({ ...c, pointsPerBooking: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
              <p className="text-slate-300 text-[11px] font-body mt-1">Ej: 10 puntos por cada cita</p>
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1.5 block">Puntos por cada $1.000 gastado en POS</label>
              <input type="number" min="0" max="100" value={config.pointsPerPurchase}
                onChange={e => setConfig(c => ({ ...c, pointsPerPurchase: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
              <p className="text-slate-300 text-[11px] font-body mt-1">Ej: 1 punto por cada $1.000</p>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-body text-slate-500 mb-1.5 block">Puntos necesarios para obtener $1 de descuento</label>
              <input type="number" min="1" value={config.pointValue}
                onChange={e => setConfig(c => ({ ...c, pointValue: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
              <p className="text-slate-300 text-[11px] font-body mt-1">Ej: 100 puntos = $1 de descuento</p>
            </div>
          </div>

          {/* Ejemplo */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs font-body leading-relaxed">
              <strong>Ejemplo:</strong> Con esta configuración, un cliente que haga {10} reservas ganará{" "}
              <strong>{config.pointsPerBooking * 10} puntos</strong>, equivalente a{" "}
              <strong>${exampleDiscount.toLocaleString("es-CL")} de descuento</strong>.
            </p>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-sans font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
            {saved ? (
              <span className="flex items-center justify-center gap-1.5">
                <Check size={14} strokeWidth={2.5} /> Guardado
              </span>
            ) : saving ? "Guardando…" : "Guardar configuración"}
          </button>
        </div>
      )}

      {!config.enabled && (
        <div className="py-4 text-center">
          <p className="text-slate-300 text-xs font-body">Activa el programa para ver la configuración</p>
        </div>
      )}
    </div>
  );
}
