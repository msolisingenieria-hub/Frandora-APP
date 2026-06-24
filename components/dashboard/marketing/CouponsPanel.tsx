"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check } from "lucide-react";

type Coupon = {
  id: string; code: string; description: string | null;
  type: "FIXED_AMOUNT" | "PERCENTAGE"; value: number;
  minAmount: number | null; maxUses: number | null;
  usedCount: number; isActive: boolean; expiresAt: string | null;
};

type FormState = {
  code: string; description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: string; minAmount: string; maxUses: string; expiresAt: string;
};
const EMPTY: FormState = {
  code: "", description: "", type: "PERCENTAGE",
  value: "", minAmount: "", maxUses: "", expiresAt: "",
};

export function CouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/coupons");
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code, description: form.description || undefined,
        type: form.type, value: Number(form.value),
        minAmount: form.minAmount ? Number(form.minAmount) : undefined,
        maxUses:   form.maxUses   ? Number(form.maxUses)   : undefined,
        expiresAt: form.expiresAt || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) { setForm(EMPTY); setShowForm(false); load(); }
    else { const d = await res.json(); alert(d.error?.message ?? d.error ?? "Error"); }
  }

  async function toggle(c: Coupon) {
    await fetch(`/api/coupons/${c.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este cupón?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    load();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => null);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-slate-500 text-sm font-body">
          Crea códigos de descuento para tus clientes. Ponlos en tus redes o dáselos en persona.
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
          <Plus size={15} /> Nuevo cupón
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-brand-teal/20 p-6 space-y-4">
          <h3 className="text-brand-navy font-sans font-semibold text-sm">Nuevo cupón</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Código</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="Ej: VERANO20" required maxLength={20}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body font-mono text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Descripción (opcional)</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ej: Descuento de verano"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Tipo</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "FIXED_AMOUNT" | "PERCENTAGE" }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal">
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED_AMOUNT">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">
                {form.type === "PERCENTAGE" ? "Porcentaje de descuento" : "Monto de descuento ($)"}
              </label>
              <input type="number" min="1" max={form.type === "PERCENTAGE" ? "100" : undefined}
                value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === "PERCENTAGE" ? "Ej: 20" : "Ej: 5000"} required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Usos máximos (vacío = ilimitado)</label>
              <input type="number" min="1" value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="Ej: 50"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Vence el (vacío = nunca)</label>
              <input type="datetime-local" value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-body text-slate-500 hover:text-brand-navy">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-sans font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
              {saving ? "Guardando…" : "Crear cupón"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="py-12 text-center">
          <Tag size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-body">Aún no tienes cupones. Crea el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div key={c.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${c.isActive ? "border-slate-100 shadow-brand" : "border-slate-100 opacity-50"}`}>
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center shrink-0">
                <Tag size={16} className="text-brand-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => copyCode(c.code)} className="font-mono font-bold text-brand-navy text-sm flex items-center gap-1.5 hover:text-brand-teal transition-colors">
                    {c.code}
                    {copied === c.code ? <Check size={12} className="text-emerald-500" /> : <Copy size={11} className="text-slate-300" />}
                  </button>
                  <span className="text-xs font-body font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {c.type === "PERCENTAGE" ? `${c.value}% dcto.` : `$${c.value.toLocaleString("es-CL")} dcto.`}
                  </span>
                  {c.expiresAt && <span className="text-[11px] text-amber-600 font-body">Vence {new Date(c.expiresAt).toLocaleDateString("es-CL")}</span>}
                </div>
                <p className="text-slate-400 text-xs font-body mt-0.5">
                  {c.description ?? "Sin descripción"} · {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""} usos
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(c)} title={c.isActive ? "Desactivar" : "Activar"}>
                  {c.isActive
                    ? <ToggleRight size={22} className="text-emerald-500" />
                    : <ToggleLeft size={22} className="text-slate-300" />}
                </button>
                <button onClick={() => remove(c.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
