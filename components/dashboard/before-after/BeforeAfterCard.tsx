"use client";

import { useState } from "react";
import { Share2, Trash2, Eye, EyeOff, Tag } from "lucide-react";
import type { BeforeAfterPhotoItem } from "@/types/before-after";
import { BeforeAfterShareModal } from "./BeforeAfterShareModal";

type Props = {
  photo: BeforeAfterPhotoItem;
  onDeleted: (id: string) => void;
};

export function BeforeAfterCard({ photo, onDeleted }: Props) {
  const [showShare, setShowShare] = useState(false);
  const [isPublic, setIsPublic] = useState(photo.isPublic);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<"before" | "after" | null>(null);

  async function handleDelete() {
    if (!confirm("¿Eliminar este par de fotos?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/before-after/${photo.id}`, { method: "DELETE" });
      onDeleted(photo.id);
    } finally {
      setDeleting(false);
    }
  }

  async function togglePublic() {
    setToggling(true);
    try {
      const res = await fetch(`/api/before-after/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (res.ok) setIsPublic((p) => !p);
    } finally {
      setToggling(false);
    }
  }

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-brand-teal/20 transition-all duration-200">
        {/* Image pair */}
        <div className="relative h-48 grid grid-cols-2 gap-0.5 bg-slate-100">
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setHoveredSide("before")}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.beforeUrl}
              alt="Antes"
              className={`w-full h-full object-cover transition-transform duration-300 ${hoveredSide === "before" ? "scale-105" : ""}`}
            />
            <div className="absolute bottom-1.5 left-1.5">
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                ANTES
              </span>
            </div>
          </div>
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setHoveredSide("after")}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.afterUrl}
              alt="Después"
              className={`w-full h-full object-cover transition-transform duration-300 ${hoveredSide === "after" ? "scale-105" : ""}`}
            />
            <div className="absolute bottom-1.5 right-1.5">
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-brand-teal/80 text-white backdrop-blur-sm">
                DESPUÉS
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3">
          {photo.caption && (
            <p className="text-xs font-body text-slate-600 mb-2 line-clamp-1">{photo.caption}</p>
          )}
          {photo.serviceTag && (
            <div className="flex items-center gap-1 mb-2">
              <Tag size={10} className="text-slate-400" />
              <span className="text-[10px] font-body text-slate-400">{photo.serviceTag}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {photo.hasConsent && (
                <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  Con consentimiento
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={togglePublic}
                disabled={toggling}
                title={isPublic ? "Hacer privada" : "Hacer pública"}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-colors"
              >
                {isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <button
                onClick={() => setShowShare(true)}
                title="Compartir"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
              >
                <Share2 size={13} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Eliminar"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShare && (
        <BeforeAfterShareModal
          photoId={photo.id}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
