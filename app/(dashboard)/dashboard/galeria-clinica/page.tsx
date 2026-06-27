"use client";

import { useState } from "react";
import { Images, Plus } from "lucide-react";
import { BeforeAfterGrid } from "@/components/dashboard/before-after/BeforeAfterGrid";
import { BeforeAfterUploader } from "@/components/dashboard/before-after/BeforeAfterUploader";

type View = "grid" | "upload";

export default function GaleriaClinicaPage() {
  const [view, setView] = useState<View>("grid");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function onUploaded() {
    setRefreshTrigger((n: number) => n + 1);
    setView("grid");
  }

  if (view === "upload") {
    return (
      <BeforeAfterUploader
        onSaved={onUploaded}
        onCancel={() => setView("grid")}
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
            <Images size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">
              Clínica
            </p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
            Galería Clínica
          </h1>
          <p className="text-slate-500 text-sm font-body mt-0.5">
            Fotos antes y después de tratamientos — solo visibles para tu equipo
          </p>
        </div>
        <button
          onClick={() => setView("upload")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-sans font-semibold shadow-sm transition-opacity hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
        >
          <Plus size={15} />
          Subir fotos
        </button>
      </div>

      <BeforeAfterGrid
        onNew={() => setView("upload")}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
