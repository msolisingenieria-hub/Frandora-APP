"use client";

import Link from "next/link";
import { ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";
import { businessUrl } from "@/lib/urls";

type Props = { slug: string };

export function PublicPageCard({ slug }: Props) {
  const [copied, setCopied] = useState(false);

  const publicUrl = businessUrl(slug);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for non-HTTPS or older browsers
    }
  };

  return (
    <div
      className="rounded-2xl p-5 border border-brand-navy/15 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3347 100%)" }}
    >
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(111,168,158,0.2) 0%, transparent 70%)" }} />
      <p className="text-brand-teal text-xs tracking-[0.15em] uppercase font-sans font-semibold mb-1 relative z-10">
        Tu página pública
      </p>
      <p className="text-white font-sans font-semibold text-sm mb-3 relative z-10 truncate">
        {slug}.frandora.cl
      </p>
      <div className="flex gap-2 relative z-10">
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-sans font-semibold py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/8 transition-colors"
        >
          {copied ? <Check size={11} className="text-brand-teal" /> : <Copy size={11} />}
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
        <Link
          href={publicUrl}
          target="_blank"
          className="flex-1 flex items-center justify-center gap-1 text-xs font-sans font-semibold py-2 rounded-lg text-white transition-all"
          style={{ background: "linear-gradient(135deg, #6FA89E, #5a9990)" }}
        >
          Previsualizar <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
