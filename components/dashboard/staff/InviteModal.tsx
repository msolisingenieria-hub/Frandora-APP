"use client";

import { useState } from "react";
import { X, Send, Check } from "lucide-react";

type Props = { onClose: () => void; onSaved: () => void };

export function InviteModal({ onClose, onSaved }: Props) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [role,  setRole]  = useState("STAFF");
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/staff/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    setSaving(false);
    if (res.ok) { setDone(true); setTimeout(() => { onSaved(); onClose(); }, 1500); }
    else { const d = await res.json(); alert(d.error?.message ?? "Error al enviar invitación"); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-sans font-bold text-brand-navy text-sm">Invitar a un profesional</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Check size={22} strokeWidth={2.5} className="text-emerald-600" />
            </div>
            <p className="font-sans font-semibold text-brand-navy text-sm">¡Invitación registrada!</p>
            <p className="text-xs font-body text-slate-400 mt-1">{email}</p>
          </div>
        ) : (
          <form onSubmit={send} className="p-5 space-y-4">
            <p className="text-xs font-body text-slate-500">
              El profesional podrá vincularse con su propia cuenta cuando inicie sesión.
            </p>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Nombre</label>
              <input required value={name} onChange={e => setName(e.target.value)}
                placeholder="Nombre del profesional"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Correo</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.cl"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Rol</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal">
                <option value="STAFF">Profesional</option>
                <option value="RECEPTIONIST">Recepcionista</option>
                <option value="MANAGER">Gerente</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-body text-slate-500">Cancelar</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-sans font-semibold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
                <Send size={13} /> {saving ? "Enviando…" : "Invitar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
