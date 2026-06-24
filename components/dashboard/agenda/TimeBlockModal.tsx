"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { format } from "date-fns";

type Props = {
  start:    Date;
  end:      Date;
  onClose:  () => void;
  onSaved?: () => void;
};

const COLORS = [
  { label: "Gris",     value: "#94a3b8" },
  { label: "Rojo",     value: "#ef4444" },
  { label: "Naranja",  value: "#f97316" },
  { label: "Azul",     value: "#3b82f6" },
  { label: "Morado",   value: "#8b5cf6" },
];

const REASONS = [
  "Vacaciones",
  "Reunión de equipo",
  "Descanso",
  "Limpieza de sala",
  "Mantenimiento",
  "Otro",
];

export function TimeBlockModal({ start, end, onClose, onSaved }: Props) {
  const [title,   setTitle]   = useState("");
  const [color,   setColor]   = useState("#94a3b8");
  const [reason,  setReason]  = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("El título es obligatorio"); return; }
    setSaving(true);
    setError("");

    const res = await fetch("/api/time-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:     title.trim(),
        startTime: start.toISOString(),
        endTime:   end.toISOString(),
        color,
        reason: reason || undefined,
      }),
    });

    setSaving(false);
    if (res.ok) { onSaved?.(); onClose(); }
    else {
      const d = await res.json();
      setError(d.error?.message ?? "Error al guardar");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-0 md:px-4"
      style={{ background: "rgba(13,27,42,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Lock size={16} className="text-slate-500" />
            </div>
            <div>
              <p className="font-sans font-bold text-brand-navy text-sm">Bloquear horario</p>
              <p className="text-[11px] font-body text-slate-400">
                {format(start, "d MMM HH:mm")} — {format(end, "HH:mm")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-brand-navy transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-body text-slate-500 mb-1.5 block">Título del bloqueo</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Reunión de equipo"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
          </div>

          <div>
            <label className="text-xs font-body text-slate-500 mb-1.5 block">Motivo (opcional)</label>
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal">
              <option value="">Sin especificar</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-body text-slate-500 mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c.value} type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c.value ? "ring-2 ring-offset-2 ring-brand-teal scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c.value }}
                  title={c.label} />
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-body">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-body text-slate-500 border border-slate-200 hover:text-brand-navy transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-sans font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
              {saving ? "Guardando…" : "Bloquear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
