"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";

interface Props {
  value:    string | null;
  onChange: (url: string | null) => void;
  label?:   string;
  hint?:    string;
  folder?:  "logos" | "banners";
}

export function LogoUploader({ value, onChange, label = "Logo del negocio", hint, folder = "logos" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      // 1. Pedir URL de subida
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, contentType: file.type, fileSize: file.size }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "No se pudo preparar la subida");
      const { uploadUrl, publicUrl } = await res.json();

      // 2. Subir el archivo directo al almacenamiento
      const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("No se pudo subir la imagen");

      onChange(publicUrl);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon size={24} className="text-slate-300" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-brand-teal" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-sans font-semibold text-brand-navy hover:bg-slate-50 transition-colors disabled:opacity-50">
              <Upload size={13} />
              {value ? "Cambiar" : "Subir imagen"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange(null)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-xs font-sans font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                <X size={13} /> Quitar
              </button>
            )}
          </div>
          <p className="text-[11px] font-body text-slate-400 mt-1.5">{hint ?? "PNG, JPG o SVG. Máx 2MB."}</p>
          {error && <p className="text-[11px] font-body text-rose-600 mt-1">{error}</p>}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}
