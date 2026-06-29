"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";

interface Props {
  value:    string | null;
  onChange: (url: string | null) => void;
  label?:   string;
  hint?:    string;
}

const MAX_DIM = 192;        // px — el logo se muestra a ~80px; 192 cubre retina y mantiene el data URL liviano
const MAX_BYTES = 160_000;  // ~160KB máx: se envía en cada carga del panel, debe ser liviano

// Redimensiona y comprime la imagen en el navegador, devuelve un data URL.
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // SVG no se rasteriza: se usa tal cual (es liviano y escalable)
    if (file.type === "image/svg+xml") {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("No se pudo leer el archivo"));
      r.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo procesar la imagen"));
        ctx.drawImage(img, 0, 0, w, h);
        // PNG conserva transparencia (importante para logos)
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Imagen inválida"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export function LogoUploader({ value, onChange, label = "Logo del negocio", hint }: Props) {
  const [processing, setProcessing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setProcessing(true);
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl.length > MAX_BYTES) {
        throw new Error("La imagen es muy pesada. Usa un logo más simple o liviano.");
      }
      onChange(dataUrl);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon size={24} className="text-slate-300" />
          )}
          {processing && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-brand-teal" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={processing}
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
          <p className="text-[11px] font-body text-slate-400 mt-1.5">{hint ?? "PNG, JPG o SVG. Se ajusta automáticamente."}</p>
          {error && <p className="text-[11px] font-body text-rose-600 mt-1">{error}</p>}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}
