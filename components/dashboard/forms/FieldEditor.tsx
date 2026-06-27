"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { FormFieldItem } from "@/types/forms";
import { FIELD_TYPE_LABELS } from "@/types/forms";

type FieldData = Omit<FormFieldItem, "id" | "formId">;

type Props = {
  field: FieldData;
  onChange: (patch: Partial<FieldData>) => void;
};

export function FieldEditor({ field, onChange }: Props) {
  const [newOption, setNewOption] = useState("");

  function addOption() {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    onChange({ options: [...(field.options ?? []), trimmed] });
    setNewOption("");
  }

  function removeOption(idx: number) {
    onChange({ options: (field.options ?? []).filter((_, i) => i !== idx) });
  }

  const showOptions = field.type === "SELECT";
  const showMinMax = field.type === "NUMBER" || field.type === "SCALE";

  return (
    <div className="space-y-4">
      <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">
        Editar campo · {FIELD_TYPE_LABELS[field.type]}
      </p>

      {/* Label */}
      <div>
        <label className="block text-xs font-body text-slate-500 mb-1">Etiqueta *</label>
        <input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Ej: Nombre completo"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal transition-colors"
        />
      </div>

      {/* Placeholder (not for boolean/signature/scale) */}
      {!["BOOLEAN", "SIGNATURE", "SCALE"].includes(field.type) && (
        <div>
          <label className="block text-xs font-body text-slate-500 mb-1">Texto de ayuda</label>
          <input
            value={field.placeholder ?? ""}
            onChange={(e) => onChange({ placeholder: e.target.value || null })}
            placeholder="Ej: Escribe aquí tu respuesta"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal transition-colors"
          />
        </div>
      )}

      {/* Help text */}
      <div>
        <label className="block text-xs font-body text-slate-500 mb-1">Descripción del campo</label>
        <input
          value={field.helpText ?? ""}
          onChange={(e) => onChange({ helpText: e.target.value || null })}
          placeholder="Instrucciones adicionales"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal transition-colors"
        />
      </div>

      {/* Min / Max */}
      {showMinMax && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-body text-slate-500 mb-1">Mínimo</label>
            <input
              type="number"
              value={field.min ?? ""}
              onChange={(e) => onChange({ min: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-body text-slate-500 mb-1">Máximo</label>
            <input
              type="number"
              value={field.max ?? ""}
              onChange={(e) => onChange({ max: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal"
            />
          </div>
        </div>
      )}

      {/* Options for SELECT */}
      {showOptions && (
        <div>
          <label className="block text-xs font-body text-slate-500 mb-2">Opciones</label>
          <div className="space-y-1.5 mb-2">
            {(field.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm font-body text-brand-navy bg-slate-50 px-3 py-1.5 rounded-lg">{opt}</span>
                <button
                  onClick={() => removeOption(i)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOption()}
              placeholder="Nueva opción"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal"
            />
            <button
              onClick={addOption}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20 transition-colors"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Required toggle */}
      <label className="flex items-center gap-3 cursor-pointer pt-1">
        <button
          type="button"
          onClick={() => onChange({ isRequired: !field.isRequired })}
          role="switch"
          aria-checked={field.isRequired}
          className={`w-9 h-5 rounded-full relative transition-colors ${field.isRequired ? "bg-brand-teal" : "bg-slate-200"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.isRequired ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
        <span className="text-sm font-body text-slate-600">Obligatorio</span>
      </label>
    </div>
  );
}
