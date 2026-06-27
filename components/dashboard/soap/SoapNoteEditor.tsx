"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, Lock, Unlock, Trash2 } from "lucide-react";
import type { SoapNoteItem } from "@/types/soap";
import { SOAP_LABELS } from "@/types/soap";

type Props = {
  note: SoapNoteItem | null;
  onSaved: () => void;
  onCancel: () => void;
};

type SoapKey = "subjective" | "objective" | "assessment" | "plan";
const SOAP_KEYS: SoapKey[] = ["subjective", "objective", "assessment", "plan"];

export function SoapNoteEditor({ note, onSaved, onCancel }: Props) {
  const [fields, setFields] = useState<Record<SoapKey, string>>({
    subjective: note?.subjective ?? "",
    objective: note?.objective ?? "",
    assessment: note?.assessment ?? "",
    plan: note?.plan ?? "",
  });
  const [isPrivate, setIsPrivate] = useState(note?.isPrivate ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autosave while editing existing notes
  useEffect(() => {
    if (!note?.id) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      fetch(`/api/soap/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, isPrivate }),
      }).catch(() => {});
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [fields, isPrivate, note?.id]);

  function set(key: SoapKey, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...fields, isPrivate };
      const url = note?.id ? `/api/soap/${note.id}` : "/api/soap";
      const method = note?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { setError("Error al guardar la ficha"); return; }
      onSaved();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!note?.id || !confirm("¿Eliminar esta ficha clínica?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/soap/${note.id}`, { method: "DELETE" });
      onSaved();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex items-center gap-1.5 text-slate-500 hover:text-brand-navy text-sm font-body transition-colors">
            <ArrowLeft size={15} /> Volver
          </button>
          <span className="text-slate-200">|</span>
          <span className="text-brand-navy font-sans font-semibold text-base">
            {note?.id ? "Editar ficha" : "Nueva ficha clínica"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {error && <p className="text-red-500 text-xs font-body">{error}</p>}
          {note?.id && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-500 text-sm font-body hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} /> Eliminar
            </button>
          )}
          <button
            onClick={() => setIsPrivate((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body transition-colors ${isPrivate ? "bg-slate-100 text-slate-500" : "bg-brand-teal/10 text-brand-teal"}`}
          >
            {isPrivate ? <Lock size={12} /> : <Unlock size={12} />}
            {isPrivate ? "Privada" : "Compartida"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-sans font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
          >
            <Save size={14} /> {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      {note?.id && (
        <div className="px-6 py-2 bg-brand-teal/5 border-b border-brand-teal/10">
          <p className="text-xs font-body text-brand-teal">Guardado automático activado · Los cambios se guardan solos cada 2 segundos</p>
        </div>
      )}

      {/* SOAP form */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOAP_KEYS.map((key) => (
            <div
              key={key}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(111,168,158,0.15) 0%, rgba(13,27,42,0.06) 100%)" }}
                >
                  <span className="text-brand-teal font-sans font-bold text-xs">{SOAP_LABELS[key].letter}</span>
                </div>
                <div>
                  <p className="text-brand-navy font-sans font-semibold text-sm">{SOAP_LABELS[key].title}</p>
                  <p className="text-slate-400 text-[11px] font-body">{SOAP_LABELS[key].description}</p>
                </div>
              </div>
              <textarea
                value={fields[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={SOAP_LABELS[key].placeholder}
                rows={6}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-teal transition-all resize-none leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
