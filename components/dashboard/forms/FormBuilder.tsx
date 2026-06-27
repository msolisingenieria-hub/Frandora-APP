"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, Plus, GripVertical, Trash2, ChevronUp, ChevronDown, Eye } from "lucide-react";
import type { FormItem, FormFieldItem, FormFieldType, FormType } from "@/types/forms";
import { FIELD_TYPE_LABELS, FORM_TYPE_LABELS } from "@/types/forms";
import { FieldEditor } from "./FieldEditor";

type Props = {
  form: FormItem | null;
  onSaved: () => void;
  onCancel: () => void;
};

type LocalField = Omit<FormFieldItem, "id" | "formId">;

function newField(type: FormFieldType, order: number): LocalField {
  return { type, label: "", placeholder: "", isRequired: false, options: [], order, helpText: null, min: null, max: null, defaultValue: null };
}

const FIELD_TYPES: FormFieldType[] = ["TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "SCALE", "SIGNATURE", "TEXTAREA", "EMAIL", "PHONE"];

export function FormBuilder({ form, onSaved, onCancel }: Props) {
  const [name, setName] = useState(form?.name ?? "");
  const [type, setType] = useState<FormType>(form?.type ?? "INTAKE");
  const [isConsent, setIsConsent] = useState(form?.isConsent ?? false);
  const [fields, setFields] = useState<LocalField[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (form?.id) {
      fetch(`/api/forms/${form.id}`)
        .then((r) => r.json())
        .then((data) => setFields(data.fields ?? []))
        .catch(() => {});
    }
  }, [form?.id]);

  function addField(fieldType: FormFieldType) {
    const field = newField(fieldType, fields.length);
    setFields((prev) => [...prev, field]);
    setSelectedIdx(fields.length);
  }

  function moveField(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= fields.length) return;
    setFields((prev) => {
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr.map((f, i) => ({ ...f, order: i }));
    });
    setSelectedIdx(next);
  }

  function removeField(idx: number) {
    setFields((prev) => prev.filter((_, i) => i !== idx).map((f, i) => ({ ...f, order: i })));
    setSelectedIdx(null);
  }

  const updateField = useCallback((idx: number, patch: Partial<LocalField>) => {
    setFields((prev) => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));
  }, []);

  async function handleSave() {
    if (!name.trim()) { setError("El nombre del formulario es obligatorio"); return; }
    setSaving(true);
    setError(null);
    try {
      const fieldsPayload = fields.map((f, i) => ({ ...f, order: i }));

      if (form?.id) {
        const res = await fetch(`/api/forms/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), type, isConsent, isActive: true, fields: fieldsPayload }),
        });
        if (!res.ok) { setError("Error al guardar el formulario"); return; }
      } else {
        const createRes = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), type, isConsent }),
        });
        if (!createRes.ok) { setError("Error al crear el formulario"); return; }
        const newForm = await createRes.json();
        if (fieldsPayload.length > 0) {
          await fetch(`/api/forms/${newForm.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fields: fieldsPayload }),
          });
        }
      }
      onSaved();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
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
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del formulario"
            className="text-brand-navy font-sans font-semibold text-base bg-transparent outline-none border-b-2 border-transparent focus:border-brand-teal pb-0.5 min-w-[200px] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          {error && <p className="text-red-500 text-xs font-body">{error}</p>}
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

      <div className="flex flex-col lg:flex-row gap-0">
        {/* Left: settings + field picker */}
        <div className="lg:w-64 shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-white/50">
          <div className="mb-5">
            <label className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FormType)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal"
            >
              {(Object.entries(FORM_TYPE_LABELS) as [FormType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer mb-6">
            <button
              type="button"
              onClick={() => setIsConsent((p) => !p)}
              role="switch"
              aria-checked={isConsent}
              className={`w-10 h-5 rounded-full relative transition-colors ${isConsent ? "bg-brand-teal" : "bg-slate-200"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isConsent ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm font-body text-slate-600">Es consentimiento</span>
          </label>

          <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">Agregar campo</p>
          <div className="grid grid-cols-2 gap-1.5">
            {FIELD_TYPES.map((ft) => (
              <button
                key={ft}
                onClick={() => addField(ft)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-sans font-medium text-brand-navy bg-slate-50 hover:bg-brand-teal/10 hover:text-brand-teal border border-slate-100 hover:border-brand-teal/30 transition-all active:scale-95"
              >
                <Plus size={11} /> {FIELD_TYPE_LABELS[ft]}
              </button>
            ))}
          </div>
        </div>

        {/* Center: canvas */}
        <div className="flex-1 p-6">
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-slate-50">
                <Eye size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-body text-sm">Agrega campos desde el panel izquierdo</p>
            </div>
          ) : (
            <div className="space-y-2 max-w-2xl">
              {fields.map((field, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`group flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedIdx === idx ? "border-brand-teal/40 bg-brand-teal/5 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"}`}
                >
                  <GripVertical size={14} className="text-slate-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium text-brand-navy truncate">
                      {field.label || <span className="text-slate-300">Sin etiqueta</span>}
                    </p>
                    <p className="text-[11px] font-body text-slate-400">
                      {FIELD_TYPE_LABELS[field.type]}{field.isRequired ? " · Obligatorio" : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-brand-navy hover:bg-slate-50 disabled:opacity-30 transition-colors">
                      <ChevronUp size={12} />
                    </button>
                    <button onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-brand-navy hover:bg-slate-50 disabled:opacity-30 transition-colors">
                      <ChevronDown size={12} />
                    </button>
                    <button onClick={() => removeField(idx)} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: field editor */}
        {selectedIdx !== null && fields[selectedIdx] && (
          <div className="lg:w-72 shrink-0 p-6 border-t lg:border-t-0 lg:border-l border-slate-100 bg-white/50">
            <FieldEditor
              field={fields[selectedIdx]}
              onChange={(patch) => updateField(selectedIdx, patch)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
