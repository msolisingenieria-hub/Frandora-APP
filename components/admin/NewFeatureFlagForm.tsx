"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Plus } from "lucide-react";

const PLANS = ["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE", "ENTERPRISE"] as const;

export function NewFeatureFlagForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    scope: "ALL" as "ALL" | "PLAN" | "BUSINESS",
    enabledForAll: false,
    rolloutPercent: 0,
    enabledPlans: [] as string[],
  });

  function togglePlan(plan: string) {
    setForm((f) => ({
      ...f,
      enabledPlans: f.enabledPlans.includes(plan)
        ? f.enabledPlans.filter((p) => p !== plan)
        : [...f.enabledPlans, plan],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: { formErrors?: string[] } };
        setError(d.error?.formErrors?.[0] ?? "Error al crear el feature flag");
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-sans font-semibold text-navy">Nuevo Feature Flag</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-body font-medium text-slate-500 mb-1">Nombre del flag <span className="text-slate-400">(ej: ai_suggestions)</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/[^a-z_]/g, "") })}
              placeholder="nombre_del_flag"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal/30"
            />
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-slate-500 mb-1">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Qué hace este flag..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal/30"
            />
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-slate-500 mb-1">Alcance</label>
            <select
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value as "ALL" | "PLAN" | "BUSINESS" })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none"
            >
              <option value="ALL">Todos los negocios</option>
              <option value="PLAN">Por plan</option>
              <option value="BUSINESS">Override por negocio</option>
            </select>
          </div>

          {form.scope === "PLAN" && (
            <div>
              <label className="block text-xs font-body font-medium text-slate-500 mb-2">Planes habilitados</label>
              <div className="flex flex-wrap gap-2">
                {PLANS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlan(p)}
                    className={`rounded-full px-3 py-1 text-xs font-sans font-medium transition-colors ${form.enabledPlans.includes(p) ? "bg-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.scope === "ALL" && (
            <div>
              <label className="block text-xs font-body font-medium text-slate-500 mb-1">
                Rollout gradual: <span className="text-navy font-semibold">{form.rolloutPercent}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.rolloutPercent}
                onChange={(e) => setForm({ ...form, rolloutPercent: Number(e.target.value) })}
                className="w-full accent-brand-teal"
              />
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabledForAll}
              onChange={(e) => setForm({ ...form, enabledForAll: e.target.checked })}
              className="h-4 w-4 rounded accent-brand-teal"
            />
            <span className="text-sm font-body text-slate-700">Activar para todos ahora</span>
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-body text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !form.name}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-navy py-2 text-sm font-sans font-semibold text-white disabled:opacity-50 hover:bg-navy/90"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Crear flag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
