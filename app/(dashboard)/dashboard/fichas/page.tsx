"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { SoapNotesList } from "@/components/dashboard/soap/SoapNotesList";
import { SoapNoteEditor } from "@/components/dashboard/soap/SoapNoteEditor";
import { SoapTemplateManager } from "@/components/dashboard/soap/SoapTemplateManager";
import type { SoapNoteItem } from "@/types/soap";

type View = "list" | "editor" | "templates";

export default function FichasPage() {
  const [view, setView] = useState<View>("list");
  const [editingNote, setEditingNote] = useState<SoapNoteItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function openEditor(note: SoapNoteItem | null) {
    setEditingNote(note);
    setView("editor");
  }

  function onSaved() {
    setRefreshTrigger((n: number) => n + 1);
    setView("list");
    setEditingNote(null);
  }

  if (view === "editor") {
    return (
      <SoapNoteEditor
        note={editingNote}
        onSaved={onSaved}
        onCancel={() => { setView("list"); setEditingNote(null); }}
      />
    );
  }

  if (view === "templates") {
    return (
      <SoapTemplateManager
        onBack={() => setView("list")}
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
            <ClipboardList size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">
              Clínica
            </p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
            Fichas Clínicas
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("templates")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-brand-navy text-sm font-sans font-semibold border border-brand-navy/20 hover:bg-brand-navy/5 transition-colors active:scale-95"
          >
            Plantillas
          </button>
          <button
            onClick={() => openEditor(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-sans font-semibold shadow-sm transition-opacity hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
          >
            Nueva ficha
          </button>
        </div>
      </div>

      <SoapNotesList
        onEdit={openEditor}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
