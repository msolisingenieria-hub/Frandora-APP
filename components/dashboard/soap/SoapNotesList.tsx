"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Search, ChevronRight, Lock } from "lucide-react";
import type { SoapNoteItem } from "@/types/soap";

type Props = {
  onEdit: (note: SoapNoteItem) => void;
  refreshTrigger: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

export function SoapNotesList({ onEdit, refreshTrigger }: Props) {
  const [notes, setNotes] = useState<SoapNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    fetch(`/api/soap?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setNotes(Array.isArray(data.notes) ? data.notes : []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [page, refreshTrigger]);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return !q || n.clientName?.toLowerCase().includes(q) || n.subjective?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente o contenido…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, rgba(111,168,158,0.12) 0%, rgba(13,27,42,0.06) 100%)" }}
          >
            <ClipboardList size={28} className="text-brand-teal" />
          </div>
          <h3 className="text-brand-navy font-sans font-semibold text-lg mb-2">Sin fichas clínicas</h3>
          <p className="text-slate-500 font-body text-sm max-w-xs">
            Las fichas registran el historial clínico de tus clientes de forma organizada.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((note) => (
            <div
              key={note.id}
              onClick={() => onEdit(note)}
              className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:border-brand-teal/20 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(111,168,158,0.12) 0%, rgba(13,27,42,0.06) 100%)" }}
              >
                <ClipboardList size={16} className="text-brand-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-sans font-semibold text-brand-navy truncate">
                    {note.clientName ?? "Sin cliente"}
                  </p>
                  {note.isPrivate && (
                    <Lock size={11} className="text-slate-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs font-body text-slate-400 truncate">
                  {note.subjective?.slice(0, 80) ?? "Sin nota subjetiva"}{note.subjective && note.subjective.length > 80 ? "…" : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-body text-slate-400">{formatDate(note.createdAt)}</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-teal transition-colors shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-body font-medium text-brand-navy border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs font-body text-slate-500">Página {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={notes.length < 20}
            className="px-3 py-1.5 rounded-lg text-xs font-body font-medium text-brand-navy border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
