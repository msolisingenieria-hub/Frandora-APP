"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, X, Check } from "lucide-react";
import type { CreateBeforeAfterInput } from "@/types/before-after";

type Props = {
  onSaved: () => void;
  onCancel: () => void;
};

type UploadSlot = { file: File; preview: string } | null;

async function uploadFileToR2(file: File, businessId: string): Promise<{ key: string; url: string }> {
  const presignRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder: "before-after",
      contentType: file.type,
      fileSize: file.size,
      businessId,
    }),
  });
  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Error al obtener URL de subida");
  }
  const { uploadUrl, key, publicUrl } = await presignRes.json() as { uploadUrl: string; key: string; publicUrl: string };
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("Error al subir la foto");
  return { key, url: publicUrl };
}

function PhotoDropzone({ label, slot, onFile, onClear }: {
  label: string;
  slot: UploadSlot;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  }

  if (slot) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-brand-teal/30 aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slot.preview} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <button onClick={onClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-red-500 text-xs font-sans font-semibold">
            <X size={12} /> Cambiar foto
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-brand-teal/80 text-white backdrop-blur-sm">
            {label.toUpperCase()}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={11} className="text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed aspect-video flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
        dragging ? "border-brand-teal bg-brand-teal/5" : "border-slate-200 hover:border-brand-teal/40 hover:bg-slate-50"
      }`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100">
        <Upload size={20} className="text-slate-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-sans font-semibold text-brand-navy">Foto {label}</p>
        <p className="text-xs font-body text-slate-400">Arrastra o haz clic para subir</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

export function BeforeAfterUploader({ onSaved, onCancel }: Props) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [beforeSlot, setBeforeSlot] = useState<UploadSlot>(null);
  const [afterSlot, setAfterSlot] = useState<UploadSlot>(null);
  const [caption, setCaption] = useState("");
  const [serviceTag, setServiceTag] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/business")
      .then((r) => r.json())
      .then((d) => setBusinessId(d.id ?? null))
      .catch(() => {});
  }, []);

  function handleFile(side: "before" | "after", file: File) {
    const preview = URL.createObjectURL(file);
    const slot = { file, preview };
    if (side === "before") setBeforeSlot(slot);
    else setAfterSlot(slot);
  }

  async function handleSave() {
    if (!beforeSlot || !afterSlot) { setError("Sube ambas fotos antes de guardar"); return; }
    if (!businessId) { setError("Error al obtener datos del negocio. Recarga la página."); return; }
    setUploading(true);
    setError(null);
    try {
      const [before, after] = await Promise.all([
        uploadFileToR2(beforeSlot.file, businessId),
        uploadFileToR2(afterSlot.file, businessId),
      ]);
      const payload: CreateBeforeAfterInput = {
        beforeKey: before.key, beforeUrl: before.url,
        afterKey: after.key, afterUrl: after.url,
        caption: caption.trim() || null,
        serviceTag: serviceTag.trim() || null,
        hasConsent, isPublic,
      };
      const res = await fetch("/api/before-after", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { setError("Error al guardar. Intenta de nuevo."); return; }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploading(false);
    }
  }

  const canSave = !!(beforeSlot && afterSlot && !uploading && businessId);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex items-center gap-1.5 text-slate-500 hover:text-brand-navy text-sm font-body transition-colors">
            <ArrowLeft size={15} /> Volver
          </button>
          <span className="text-slate-200">|</span>
          <span className="text-brand-navy font-sans font-semibold text-base">Subir fotos antes y después</span>
        </div>
        <div className="flex items-center gap-2">
          {error && <p className="text-red-500 text-xs font-body max-w-xs text-right">{error}</p>}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-sans font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
          >
            {uploading
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Subiendo…</>
              : <><Upload size={14} /> Guardar fotos</>
            }
          </button>
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <PhotoDropzone label="antes" slot={beforeSlot} onFile={(f) => handleFile("before", f)} onClear={() => setBeforeSlot(null)} />
          <PhotoDropzone label="después" slot={afterSlot} onFile={(f) => handleFile("after", f)} onClear={() => setAfterSlot(null)} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <div>
            <label className="block text-xs font-body text-slate-500 mb-1">Descripción (opcional)</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ej: Resultado de tratamiento de queratina"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-teal transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-body text-slate-500 mb-1">Servicio (opcional)</label>
            <input
              value={serviceTag}
              onChange={(e) => setServiceTag(e.target.value)}
              placeholder="Ej: Corte, Tinte, Lifting"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-teal transition-colors"
            />
          </div>
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setHasConsent((p) => !p)}
                role="switch"
                aria-checked={hasConsent}
                className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${hasConsent ? "bg-brand-teal" : "bg-slate-200"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasConsent ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm font-body text-slate-600">El cliente dio su consentimiento para publicar estas fotos</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setIsPublic((p) => !p)}
                role="switch"
                aria-checked={isPublic}
                className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${isPublic ? "bg-brand-teal" : "bg-slate-200"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm font-body text-slate-600">Mostrar en la galería pública del negocio</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
