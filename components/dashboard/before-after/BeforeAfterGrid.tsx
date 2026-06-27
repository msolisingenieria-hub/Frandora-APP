"use client";

import { useEffect, useState } from "react";
import { Images, Filter, Plus } from "lucide-react";
import type { BeforeAfterPhotoItem } from "@/types/before-after";
import { BeforeAfterCard } from "./BeforeAfterCard";

type Props = {
  onNew: () => void;
  refreshTrigger: number;
};

export function BeforeAfterGrid({ onNew, refreshTrigger }: Props) {
  const [photos, setPhotos] = useState<BeforeAfterPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublicFilter, setIsPublicFilter] = useState<"all" | "public" | "private">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (isPublicFilter === "public") params.set("isPublic", "true");
    if (isPublicFilter === "private") params.set("isPublic", "false");
    fetch(`/api/before-after?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPhotos(Array.isArray(data.photos) ? data.photos : []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [page, isPublicFilter, refreshTrigger]);

  function onDeleted(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
            <div className="h-48 bg-slate-100" />
            <div className="p-4">
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        <Filter size={13} className="text-slate-400" />
        {(["all", "public", "private"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setIsPublicFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors ${isPublicFilter === f ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
          >
            {f === "all" ? "Todas" : f === "public" ? "Públicas" : "Privadas"}
          </button>
        ))}
        <span className="ml-auto text-xs font-body text-slate-400">{total} foto{total !== 1 ? "s" : ""}</span>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, rgba(111,168,158,0.12) 0%, rgba(13,27,42,0.06) 100%)" }}
          >
            <Images size={28} className="text-brand-teal" />
          </div>
          <h3 className="text-brand-navy font-sans font-semibold text-lg mb-2">Sin fotos aún</h3>
          <p className="text-slate-500 font-body text-sm mb-6 max-w-xs">
            Sube pares de fotos antes y después para mostrar los resultados de tus tratamientos.
          </p>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-sans font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
          >
            <Plus size={15} /> Subir primera foto
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <BeforeAfterCard key={photo.id} photo={photo} onDeleted={onDeleted} />
            ))}
          </div>
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
                disabled={photos.length < 20}
                className="px-3 py-1.5 rounded-lg text-xs font-body font-medium text-brand-navy border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
