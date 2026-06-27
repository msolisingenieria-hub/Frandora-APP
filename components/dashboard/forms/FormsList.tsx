"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, Copy, ChevronRight, Plus } from "lucide-react";
import type { FormItem } from "@/types/forms";
import { FORM_TYPE_LABELS } from "@/types/forms";

type Props = {
  onEdit: (form: FormItem) => void;
  onNew: () => void;
  refreshTrigger: number;
};

export function FormsList({ onEdit, onNew, refreshTrigger }: Props) {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/forms")
      .then((r) => r.json())
      .then((data) => setForms(Array.isArray(data) ? data : []))
      .catch(() => setForms([]))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este formulario?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/forms/${id}`, { method: "DELETE" });
      setForms((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDuplicate(id: string) {
    setDuplicatingId(id);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      if (res.ok) {
        const newForm = await res.json() as FormItem;
        setForms((prev) => [newForm, ...prev]);
      }
    } finally {
      setDuplicatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "linear-gradient(135deg, rgba(111,168,158,0.12) 0%, rgba(13,27,42,0.06) 100%)" }}
        >
          <FileText size={28} className="text-brand-teal" />
        </div>
        <h3 className="text-brand-navy font-sans font-semibold text-lg mb-2">Sin formularios aún</h3>
        <p className="text-slate-500 font-body text-sm mb-6 max-w-xs">
          Crea formularios de consentimiento, intakes o cuestionarios para tus clientes.
        </p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-sans font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
        >
          <Plus size={15} /> Crear primer formulario
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.map((form) => (
        <div
          key={form.id}
          className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-brand-teal/20 transition-all duration-200 cursor-pointer"
          onClick={() => onEdit(form)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(111,168,158,0.15) 0%, rgba(13,27,42,0.06) 100%)" }}
            >
              <FileText size={16} className="text-brand-teal" />
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleDuplicate(form.id)}
                disabled={duplicatingId === form.id}
                title="Duplicar"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-colors"
              >
                <Copy size={13} />
              </button>
              <button
                onClick={() => handleDelete(form.id)}
                disabled={deletingId === form.id}
                title="Eliminar"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <h3 className="font-sans font-semibold text-brand-navy text-sm leading-snug mb-1 truncate">{form.name}</h3>
          <p className="text-xs font-body text-slate-400 mb-3">
            {FORM_TYPE_LABELS[form.type]} · {form.fieldsCount ?? 0} campos
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${form.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                {form.isActive ? "Activo" : "Inactivo"}
              </span>
              {form.isConsent && (
                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal">
                  Consentimiento
                </span>
              )}
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-teal transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}
