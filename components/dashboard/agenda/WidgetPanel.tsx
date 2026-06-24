"use client";

import { useState } from "react";
import { Copy, Check, Code, ExternalLink } from "lucide-react";

type Props = { slug: string };

export function WidgetPanel({ slug }: Props) {
  const [copied, setCopied] = useState<"iframe" | "script" | null>(null);

  const widgetUrl = `https://${slug}.frandora.cl/widget/${slug}`;
  const bookingUrl = `https://${slug}.frandora.cl`;

  const iframeCode = `<iframe
  src="${widgetUrl}"
  width="280"
  height="160"
  frameborder="0"
  style="border-radius:16px;overflow:hidden;"
  title="Reservar en ${slug}"
></iframe>`;

  const buttonCode = `<a
  href="${bookingUrl}"
  target="_blank"
  style="display:inline-block;padding:12px 28px;background:#0D1B2A;color:#fff;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;font-family:sans-serif;"
>
  Reservar hora →
</a>`;

  function copy(text: string, type: "iframe" | "script") {
    navigator.clipboard.writeText(text).catch(() => null);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-500 text-sm font-body">
        Copia el código y pégalo en tu sitio web para que tus clientes reserven directamente desde ahí.
      </p>

      {/* Previsualización */}
      <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center">
        <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a3347] rounded-2xl p-5 flex flex-col items-center gap-3 w-64 shadow-xl">
          <div className="text-center">
            <p className="text-[#CFE3DF] text-[10px] font-semibold uppercase tracking-widest">Reserva online</p>
            <p className="text-white text-base font-bold font-sans mt-1 capitalize">{slug.replace(/-/g, " ")}</p>
          </div>
          <a href={bookingUrl} target="_blank" rel="noreferrer"
            className="block w-full py-2.5 rounded-xl text-sm font-bold text-white text-center"
            style={{ background: "#6FA89E" }}>
            Reservar hora →
          </a>
          <p className="text-white/30 text-[9px]">Powered by <strong className="text-white/50">Frandora</strong></p>
        </div>
      </div>

      {/* Código iframe */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-body font-semibold text-slate-500 flex items-center gap-1.5">
            <Code size={12} /> Widget completo (iframe)
          </label>
          <button onClick={() => copy(iframeCode, "iframe")}
            className="flex items-center gap-1.5 text-xs font-body text-brand-teal hover:text-brand-navy transition-colors">
            {copied === "iframe" ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
        <pre className="bg-slate-900 text-slate-300 text-[11px] font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
          {iframeCode}
        </pre>
      </div>

      {/* Código botón simple */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-body font-semibold text-slate-500 flex items-center gap-1.5">
            <Code size={12} /> Botón simple (enlace)
          </label>
          <button onClick={() => copy(buttonCode, "script")}
            className="flex items-center gap-1.5 text-xs font-body text-brand-teal hover:text-brand-navy transition-colors">
            {copied === "script" ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
        <pre className="bg-slate-900 text-slate-300 text-[11px] font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
          {buttonCode}
        </pre>
      </div>

      {/* Link directo */}
      <div className="bg-brand-teal/5 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-body font-semibold text-brand-navy">Tu página de reservas</p>
          <p className="text-xs font-body text-slate-400 font-mono mt-0.5">{bookingUrl}</p>
        </div>
        <a href={bookingUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-body text-brand-teal hover:text-brand-navy font-semibold transition-colors shrink-0">
          <ExternalLink size={12} /> Abrir
        </a>
      </div>

      {/* Redes sociales */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
        <p className="text-xs font-body font-semibold text-slate-500 uppercase tracking-wide">También puedes compartir</p>
        <div className="space-y-2">
          {[
            { label: "Instagram", desc: "Agrega el link en tu bio → Editar perfil → Sitio web" },
            { label: "Facebook", desc: "Perfil → Agregar botón → Reservar ahora → pega tu link" },
            { label: "Google Business", desc: "Google My Business → Editar → Botones → Reservar → pega tu link" },
            { label: "WhatsApp", desc: `Comparte este link con tus clientes: ${bookingUrl}` },
          ].map(s => (
            <div key={s.label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-slate-500">{s.label[0]}</span>
              </div>
              <div>
                <p className="text-sm font-body font-semibold text-brand-navy">{s.label}</p>
                <p className="text-xs font-body text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
