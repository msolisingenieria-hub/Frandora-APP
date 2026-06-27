"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, Link } from "lucide-react";

type Props = {
  photoId: string;
  onClose: () => void;
};

export function BeforeAfterShareModal({ photoId, onClose }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/before-after/${photoId}/share`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => setToken(data.token ?? null))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [photoId]);

  const shareUrl = token ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/ba/${token}` : "";

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full sm:max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 0.25s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Link size={15} className="text-brand-teal" />
            <p className="text-brand-navy font-sans font-semibold text-sm">Compartir resultado</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !token ? (
            <p className="text-slate-500 font-body text-sm text-center py-4">
              No se pudo generar el enlace. Intenta de nuevo.
            </p>
          ) : (
            <>
              <p className="text-slate-500 font-body text-sm mb-4">
                Comparte este enlace con tu cliente. Expira en 30 días y no requiere que el cliente inicie sesión.
              </p>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                <p className="flex-1 text-xs font-body text-slate-600 truncate">{shareUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-sans font-semibold transition-all active:scale-95"
                style={{ background: copied ? "linear-gradient(135deg, #6FA89E 0%, #5a9990 100%)" : "linear-gradient(135deg, #0D1B2A 0%, #132539 100%)" }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "¡Copiado!" : "Copiar enlace"}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
