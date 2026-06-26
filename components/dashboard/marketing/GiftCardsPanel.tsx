"use client";

import { useState, useEffect, useCallback } from "react";
import { Gift, Plus, Copy, Check, Search, AlertCircle } from "lucide-react";

type GiftCard = {
  id: string; code: string; initialValue: number; currentValue: number;
  status: "ACTIVE" | "USED" | "EXPIRED" | "CANCELED";
  purchaserName: string | null; purchaserEmail: string | null;
  message: string | null; expiresAt: string | null; createdAt: string;
};

const EMPTY = {
  initialValue: "", purchaserName: "", purchaserEmail: "",
  recipientEmail: "", message: "", expiresAt: "",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activa", USED: "Usada", EXPIRED: "Vencida", CANCELED: "Cancelada",
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  USED:   "bg-slate-100 text-slate-500",
  EXPIRED: "bg-amber-100 text-amber-700",
  CANCELED: "bg-red-100 text-red-600",
};

export function GiftCardsPanel() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [checkCode, setCheckCode] = useState("");
  const [checkResult, setCheckResult] = useState<{ valid: boolean; balance?: number; error?: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/gift-cards");
    if (res.ok) setCards(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/gift-cards", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initialValue:   Number(form.initialValue),
        purchaserName:  form.purchaserName  || undefined,
        purchaserEmail: form.purchaserEmail || undefined,
        recipientEmail: form.recipientEmail || undefined,
        message:        form.message        || undefined,
        expiresAt:      form.expiresAt      || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) { setForm(EMPTY); setShowForm(false); load(); }
    else { const d = await res.json(); alert(d.error ?? "Error al crear"); }
  }

  async function handleCheck() {
    if (!checkCode.trim()) return;
    const res = await fetch(`/api/gift-cards/${checkCode.trim()}`);
    setCheckResult(await res.json());
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
          Genera tarjetas de regalo con código único. El cliente las canjea en tu local o al reservar.
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
          <Plus size={15} /> Nueva tarjeta
        </button>
      </div>

      {/* Verificar saldo */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-sans font-semibold text-slate-500 mb-2">Verificar saldo de una tarjeta</p>
        <div className="flex gap-2">
          <input value={checkCode} onChange={e => setCheckCode(e.target.value.toUpperCase())}
            placeholder="Ej: GC-A1B2C3D4" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-body focus:outline-none focus:border-brand-teal bg-white" />
          <button onClick={handleCheck} className="px-4 py-2 rounded-xl bg-brand-navy text-white text-sm font-sans font-semibold flex items-center gap-1.5">
            <Search size={14} /> Verificar
          </button>
        </div>
        {checkResult && (
          <div className={`mt-2 px-3 py-2.5 rounded-xl text-sm font-body flex items-center gap-2 ${checkResult.valid ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
            {checkResult.valid
              ? <><Check size={14} strokeWidth={2.5} className="flex-shrink-0" /> Saldo disponible: ${checkResult.balance?.toLocaleString("es-CL")}</>
              : <><AlertCircle size={14} className="flex-shrink-0" /> {checkResult.error}</>}
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-brand-teal/20 p-6 space-y-4">
          <h3 className="text-brand-navy font-sans font-semibold text-sm">Nueva tarjeta de regalo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Valor ($)</label>
              <input type="number" min="1" required value={form.initialValue}
                onChange={e => setForm(f => ({ ...f, initialValue: e.target.value }))} placeholder="Ej: 20000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Vence el (vacío = nunca)</label>
              <input type="datetime-local" value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Nombre de quien regala (opcional)</label>
              <input value={form.purchaserName} onChange={e => setForm(f => ({ ...f, purchaserName: e.target.value }))}
                placeholder="Ej: Familia González"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Email del destinatario (opcional)</label>
              <input type="email" value={form.recipientEmail} onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
                placeholder="destinatario@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-body text-slate-500 mb-1 block">Mensaje de regalo (opcional)</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={2} placeholder="Ej: ¡Feliz cumpleaños! Disfruta tu día."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body bg-slate-50 focus:outline-none focus:border-brand-teal resize-none" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-body text-slate-500 hover:text-brand-navy">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-sans font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
              {saving ? "Generando…" : "Crear tarjeta"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[0,1].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : cards.length === 0 ? (
        <div className="py-12 text-center">
          <Gift size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-body">Aún no tienes tarjetas. Crea la primera.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-brand p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Gift size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => copyCode(c.code)} className="font-mono font-bold text-brand-navy text-sm flex items-center gap-1.5 hover:text-brand-teal transition-colors">
                    {c.code}
                    {copied === c.code ? <Check size={12} className="text-emerald-500" /> : <Copy size={11} className="text-slate-300" />}
                  </button>
                  <span className={`text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                </div>
                <p className="text-slate-400 text-xs font-body mt-0.5">
                  Saldo: <strong className="text-brand-navy">${c.currentValue.toLocaleString("es-CL")}</strong>
                  {" "}/ Inicial: ${c.initialValue.toLocaleString("es-CL")}
                  {c.purchaserName && <> · De: {c.purchaserName}</>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
