"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const ROLES = [
  { value: "STAFF",         label: "Profesional" },
  { value: "RECEPTIONIST",  label: "Recepcionista" },
  { value: "MANAGER",       label: "Gerente" },
  { value: "BUSINESS_OWNER",label: "Propietario" },
];

const COLORS = ["#6d28d9","#0D1B2A","#6FA89E","#dc2626","#d97706","#059669","#2563eb","#db2777"];

type FormData = {
  name: string; email: string; phone: string; bio: string;
  role: string; color: string; commissionRate: number; commissionType: string;
  acceptsBookings: boolean; avatarUrl: string;
};

const EMPTY: FormData = { name: "", email: "", phone: "", bio: "", role: "STAFF", color: "#6d28d9", commissionRate: 0, commissionType: "PERCENT", acceptsBookings: true, avatarUrl: "" };

type Props = {
  initial?: Partial<FormData>;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  title?: string;
};

export function StaffForm({ initial, onSave, onCancel, title = "Nuevo profesional" }: Props) {
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormData, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-sans font-bold text-brand-navy text-base">{title}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-body text-slate-500 mb-1 block">Nombre completo *</label>
              <input required value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Ej: Juan Martínez"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Correo</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="juan@correo.cl"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Teléfono</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="+56 9 xxxx xxxx"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Rol</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Comisión</label>
              <div className="flex gap-2">
                <input type="number" min="0" max="100" value={form.commissionRate}
                  onChange={e => set("commissionRate", Number(e.target.value))}
                  className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
                <select value={form.commissionType} onChange={e => set("commissionType", e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal">
                  <option value="PERCENT">% por servicio</option>
                  <option value="FIXED">$ fijo por cita</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-body text-slate-500 mb-1 block">Bio / descripción</label>
              <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={2}
                placeholder="Especialidades, años de experiencia, etc."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-body text-slate-500 mb-1 block">Foto del profesional</label>
              <input type="url" value={form.avatarUrl} onChange={e => set("avatarUrl", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
              {form.avatarUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <Image src={form.avatarUrl} alt="Vista previa" fill className="object-cover" sizes="56px"
                      onError={() => set("avatarUrl", "")} />
                  </div>
                  <p className="text-xs font-body text-slate-400">Vista previa de la foto</p>
                </div>
              )}
              {!form.avatarUrl && (
                <p className="mt-1 text-xs font-body text-slate-400">Pega la URL de una foto. Aparece en la página de reservas.</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-body text-slate-500 mb-2 block">Color en la agenda</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set("color", c)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: form.color === c ? "#0D1B2A" : "transparent" }} />
                ))}
              </div>
            </div>

            {/* Atiende clientes — controla si aparece en la agenda */}
            <div className="sm:col-span-2">
              <button type="button" onClick={() => set("acceptsBookings", !form.acceptsBookings)}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                <div>
                  <p className="text-sm font-sans font-semibold text-brand-navy">Atiende clientes</p>
                  <p className="text-xs font-body text-slate-400">Aparece en la agenda y puede recibir reservas</p>
                </div>
                <span className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.acceptsBookings ? "bg-brand-teal" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.acceptsBookings ? "left-[22px]" : "left-0.5"}`} />
                </span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-body text-slate-500 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-sans font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
