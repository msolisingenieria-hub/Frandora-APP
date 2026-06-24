"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Clock, DollarSign, Globe, Lock, Pencil, Trash2, Sparkles } from "lucide-react";
import type { ServiceListItem } from "@/lib/services/service.service";

type Mode = "view" | "edit" | "new";

type FormState = {
  name: string; description: string; duration: string;
  price: string; isOnline: boolean;
};

const defaultForm: FormState = { name: "", description: "", duration: "30", price: "0", isOnline: true };

export function ServicesGrid() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [mode, setMode]         = useState<Mode>("view");
  const [editing, setEditing]   = useState<ServiceListItem | null>(null);
  const [form, setForm]         = useState<FormState>(defaultForm);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(defaultForm);
    setEditing(null);
    setMode("new");
  };

  const openEdit = (s: ServiceListItem) => {
    setForm({ name: s.name, description: s.description ?? "", duration: String(s.duration), price: String(s.price), isOnline: s.isOnline });
    setEditing(s);
    setMode("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { name: form.name, description: form.description || null, duration: parseInt(form.duration) || 30, price: parseFloat(form.price) || 0, isOnline: form.isOnline };
    try {
      if (mode === "new") {
        await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else if (editing) {
        await fetch(`/api/services/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      await load();
      setMode("view");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    await load();
  };

  if (mode === "new" || mode === "edit") {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6 max-w-lg">
        <h2 className="text-brand-navy font-sans font-semibold text-lg mb-6">
          {mode === "new" ? "Nuevo servicio" : "Editar servicio"}
        </h2>
        <div className="space-y-4">
          {[
            { label: "Nombre *", key: "name" as const, type: "text" },
            { label: "Descripción", key: "description" as const, type: "text" },
            { label: "Duración (minutos) *", key: "duration" as const, type: "number" },
            { label: "Precio ($) *", key: "price" as const, type: "number" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type} value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 font-body text-brand-navy"
              />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm((p) => ({ ...p, isOnline: !p.isOnline }))}
              className={[
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-sans font-semibold transition-all",
                form.isOnline ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500",
              ].join(" ")}>
              {form.isOnline ? <Globe size={14} /> : <Lock size={14} />}
              {form.isOnline ? "Visible en web" : "Solo presencial"}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setMode("view")} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-sans font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="flex-1 py-2.5 rounded-xl text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-px transition-all"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
            {saving ? "Guardando..." : (mode === "new" ? "Crear servicio" : "Guardar")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm text-white hover:-translate-y-px transition-all"
          style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
          <Plus size={15} /> Nuevo servicio
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-sans font-medium mb-1">Aún no hay servicios</p>
          <p className="text-slate-400 text-sm font-body mb-6">Agrega los servicios que ofrece tu negocio</p>
          <button onClick={openNew}
            className="px-6 py-2.5 rounded-xl font-sans font-semibold text-sm text-white inline-flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
            <Plus size={15} /> Crear primer servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5 hover:border-brand-teal/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(13,27,42,0.08), rgba(111,168,158,0.12))" }}>
                  <Sparkles size={16} className="text-brand-teal" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <Pencil size={13} className="text-slate-400" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg border border-red-100 flex items-center justify-center hover:bg-red-50 transition-colors">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
              <h3 className="text-brand-navy font-sans font-semibold text-sm mb-1">{s.name}</h3>
              {s.description && <p className="text-slate-400 text-xs font-body mb-3 line-clamp-2">{s.description}</p>}
              <div className="flex items-center gap-3 mt-auto">
                <div className="flex items-center gap-1 text-slate-500 text-xs font-body">
                  <Clock size={12} />
                  {s.duration} min
                </div>
                <div className="flex items-center gap-1 text-brand-navy font-sans font-semibold text-sm">
                  <DollarSign size={12} />
                  {s.price.toLocaleString("es-CL")}
                </div>
                {s.isOnline ? (
                  <Globe size={12} className="text-emerald-500 ml-auto" />
                ) : (
                  <Lock size={12} className="text-slate-300 ml-auto" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
