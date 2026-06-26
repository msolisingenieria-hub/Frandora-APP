"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle } from "lucide-react";
import { businessUrl } from "@/lib/urls";

type ApptInfo = {
  businessName: string;
  businessSlug: string;
  serviceName:  string;
  staffName:    string | null;
};

export default function OpinionPage({
  params,
}: {
  params: Promise<{ slug: string; appointmentId: string }>;
}) {
  const [resolved, setResolved] = useState<{ slug: string; appointmentId: string } | null>(null);
  const [info, setInfo] = useState<ApptInfo | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    params.then(setResolved);
  }, [params]);

  useEffect(() => {
    if (!resolved) return;
    fetch(`/api/reviews/appointment-info/${resolved.appointmentId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setInfo(d); })
      .catch(() => null);
  }, [resolved]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || !resolved) return;
    setStatus("sending");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId:    info?.businessSlug ?? resolved.slug,
        appointmentId: resolved.appointmentId,
        clientName:    name,
        clientEmail:   email || undefined,
        rating,
        comment: comment || undefined,
      }),
    });

    if (res.ok) {
      setStatus("done");
    } else {
      const d = await res.json();
      setErrorMsg(d.error?.message ?? d.error ?? "Hubo un error. Intenta de nuevo.");
      setStatus("error");
    }
  }

  const businessName = info?.businessName ?? "el negocio";

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg,#0D1B2A 0%,#1a3347 40%,#0d2535 100%)" }}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, #dcfce7, #bbf7d0)" }}>
            <CheckCircle size={32} className="text-emerald-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-brand-navy font-sans font-bold text-2xl mb-2">¡Gracias por tu opinión!</h2>
          <p className="text-slate-400 font-body text-sm mb-7">
            Tu comentario ayuda a {businessName} a seguir mejorando.
          </p>
          <a href={resolved ? businessUrl(resolved.slug) : "/"}
            className="block w-full py-3 rounded-xl text-sm font-sans font-semibold text-white text-center transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg,#0D1B2A 0%,#1a3347 40%,#0d2535 100%)" }}>
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={22} className="text-brand-navy/50" strokeWidth={1.5} />
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-xl mb-1.5">¿Cómo te fue?</h1>
          <p className="text-slate-400 font-body text-sm leading-relaxed">
            Deja tu opinión sobre tu visita a{" "}
            <strong className="text-brand-navy font-semibold">{businessName}</strong>
            {info?.serviceName ? ` — ${info.serviceName}` : ""}
            {info?.staffName ? ` con ${info.staffName}` : ""}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Estrellas */}
          <div className="text-center">
            <p className="text-xs font-body text-slate-500 mb-3">¿Cuántas estrellas le das?</p>
            <div className="flex justify-center gap-1.5">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button"
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  className="transition-transform duration-100 hover:scale-110 active:scale-95">
                  <Star size={36}
                    className={`transition-colors duration-100 ${
                      n <= (hovered || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200"
                    }`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs font-body text-slate-400 mt-2">
                {["", "Muy malo", "Malo", "Regular", "Bueno", "¡Excelente!"][rating]}
              </p>
            )}
          </div>

          {/* Comentario */}
          <div>
            <label className="text-xs font-body text-slate-500 mb-1.5 block">
              Cuéntanos más <span className="text-slate-300">(opcional)</span>
            </label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              rows={3} maxLength={1000}
              placeholder="¿Qué fue lo que más te gustó? ¿Hay algo que podríamos mejorar?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-navy/30 focus:ring-2 focus:ring-brand-navy/8 resize-none transition-colors duration-150" />
          </div>

          {/* Datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body text-slate-500 mb-1.5 block">Tu nombre</label>
              <input required value={name} onChange={e => setName(e.target.value)}
                placeholder="Ej: María"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-navy/30 focus:ring-2 focus:ring-brand-navy/8 transition-colors duration-150" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1.5 block">
                Tu correo <span className="text-slate-300">(opcional)</span>
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-navy/30 focus:ring-2 focus:ring-brand-navy/8 transition-colors duration-150" />
            </div>
          </div>

          {status === "error" && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm font-body">
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={!rating || status === "sending"}
            className="w-full py-3.5 rounded-xl text-sm font-sans font-semibold text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
            {status === "sending" ? "Enviando…" : "Publicar mi opinión"}
          </button>

          <p className="text-center text-slate-300 text-[11px] font-body">
            Tu opinión puede ser visible en la página pública del negocio.
          </p>
        </form>
      </div>
    </div>
  );
}
