"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Star, StarOff } from "lucide-react";
import type { SoapTemplateItem, CreateSoapTemplateInput } from "@/types/soap";

type Props = {
  onBack: () => void;
};

export function SoapTemplateManager({ onBack }: Props) {
  const [templates, setTemplates] = useState<SoapTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/soap/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload: CreateSoapTemplateInput = { name: name.trim() };
      const res = await fetch("/api/soap/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const t = await res.json();
        setTemplates((prev) => [t, ...prev]);
        setName("");
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/soap/templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleDefault(id: string, current: boolean) {
    const res = await fetch(`/api/soap/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: !current }),
    });
    if (res.ok) {
      setTemplates((prev) =>
        prev.map((t) => t.id === id
          ? { ...t, isDefault: !current }
          : { ...t, isDefault: false }
        )
      );
    }
  }

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-brand-navy text-sm font-body transition-colors">
            <ArrowLeft size={15} /> Fichas
          </button>
          <span className="text-slate-200">|</span>
          <h1 className="text-brand-navy font-sans font-bold text-2xl tracking-tight">Plantillas SOAP</h1>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-sans font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
        >
          <Plus size={15} /> Nueva plantilla
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-teal/20 p-5 mb-5 shadow-sm">
          <p className="text-sm font-sans font-semibold text-brand-navy mb-3">Nueva plantilla</p>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Nombre de la plantilla"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-teal transition-colors"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim()}
              className="px-4 py-2 rounded-xl text-white text-sm font-sans font-semibold bg-brand-teal hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Creando…" : "Crear"}
            </button>
            <button
              onClick={() => { setShowForm(false); setName(""); }}
              className="px-3 py-2 rounded-xl text-slate-500 text-sm font-body border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-400 font-body text-sm">Sin plantillas. Crea una para reutilizarla en tus fichas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-sans font-semibold text-brand-navy truncate">{t.name}</p>
                  {t.isDefault && (
                    <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal">Predeterminada</span>
                  )}
                </div>
                {t.serviceId && (
                  <p className="text-xs font-body text-slate-400 mt-0.5">Vinculada a servicio</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleDefault(t.id, t.isDefault)}
                  title={t.isDefault ? "Quitar predeterminada" : "Marcar como predeterminada"}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
                >
                  {t.isDefault ? <Star size={14} className="text-brand-teal fill-brand-teal" /> : <StarOff size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
