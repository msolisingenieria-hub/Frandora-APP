"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { FormsList } from "@/components/dashboard/forms/FormsList";
import { FormBuilder } from "@/components/dashboard/forms/FormBuilder";
import type { FormItem } from "@/types/forms";

type View = "list" | "builder";

export default function FormulariosPage() {
  const [view, setView] = useState<View>("list");
  const [editingForm, setEditingForm] = useState<FormItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function openBuilder(form: FormItem | null) {
    setEditingForm(form);
    setView("builder");
  }

  function onSaved() {
    setRefreshTrigger((n: number) => n + 1);
    setView("list");
    setEditingForm(null);
  }

  if (view === "builder") {
    return (
      <FormBuilder
        form={editingForm}
        onSaved={onSaved}
        onCancel={() => { setView("list"); setEditingForm(null); }}
      />
    );
  }

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <FileText size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">
              Clínica
            </p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
            Formularios
          </h1>
        </div>
        <button
          onClick={() => openBuilder(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-sans font-semibold shadow-sm transition-opacity hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
        >
          <Plus size={15} />
          Nuevo formulario
        </button>
      </div>

      <FormsList
        onEdit={openBuilder}
        onNew={() => openBuilder(null)}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
