"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Review = {
  id: string; clientName: string; clientEmail: string | null;
  rating: number; comment: string | null;
  isPublic: boolean; isVerified: boolean;
  reply: string | null; repliedAt: string | null; createdAt: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={12} className={n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
      ))}
    </div>
  );
}

export function ReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/reviews");
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function sendReply(id: string) {
    if (!replyText.trim()) return;
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText }),
    });
    setReplyingId(null); setReplyText(""); load();
  }

  async function toggleVisibility(r: Review) {
    await fetch(`/api/reviews/${r.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !r.isPublic }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta opinión?")) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Calificación promedio", value: `${avg} ★` },
            { label: "Opiniones totales", value: reviews.length.toString() },
            { label: "Opiniones públicas", value: reviews.filter(r => r.isPublic).length.toString() },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-brand">
              <p className="text-brand-navy font-sans font-bold text-xl mb-0.5">{s.value}</p>
              <p className="text-slate-400 text-xs font-body">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-slate-500 text-sm font-body">
        Las opiniones verificadas son de clientes que reservaron a través de Frandora.
      </p>

      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center">
          <Star size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-body">Aún no tienes opiniones. Las verás aquí cuando lleguen.</p>
          <p className="text-slate-300 text-xs font-body mt-1">Los correos post-atención incluyen un link para dejar opinión.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`bg-white rounded-2xl border p-4 transition-all ${r.isPublic ? "border-slate-100 shadow-brand" : "border-slate-100 opacity-60"}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-teal/10 flex items-center justify-center shrink-0 font-sans font-bold text-brand-teal text-sm">
                  {r.clientName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-brand-navy font-sans font-semibold text-sm">{r.clientName}</p>
                    {r.isVerified && <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal">Verificada</span>}
                    {!r.isPublic && <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">Oculta</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars rating={r.rating} />
                    <span className="text-slate-300 text-[11px] font-body">{new Date(r.createdAt).toLocaleDateString("es-CL")}</span>
                  </div>
                  {r.comment && (
                    <p className="text-slate-500 text-sm font-body mt-1.5 leading-relaxed">{r.comment}</p>
                  )}
                  {r.reply && (
                    <div className="mt-2 bg-slate-50 rounded-xl p-3">
                      <p className="text-[11px] font-sans font-semibold text-brand-teal mb-1">Tu respuesta:</p>
                      <p className="text-slate-500 text-xs font-body">{r.reply}</p>
                    </div>
                  )}
                  {/* Responder */}
                  {expanded === r.id && !r.reply && (
                    <div className="mt-3 space-y-2">
                      <textarea value={replyingId === r.id ? replyText : ""}
                        onFocus={() => setReplyingId(r.id)}
                        onChange={e => setReplyText(e.target.value)}
                        rows={2} placeholder="Escribe tu respuesta…"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-body resize-none focus:outline-none focus:border-brand-teal" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setExpanded(null); setReplyText(""); }}
                          className="px-3 py-1.5 text-xs font-body text-slate-400 hover:text-brand-navy">Cancelar</button>
                        <button onClick={() => sendReply(r.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-sans font-semibold text-white"
                          style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
                          Publicar respuesta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!r.reply && (
                    <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="text-slate-300 hover:text-brand-teal transition-colors" title="Responder">
                      {expanded === r.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  )}
                  <button onClick={() => toggleVisibility(r)} title={r.isPublic ? "Ocultar" : "Publicar"} className="text-slate-300 hover:text-brand-navy transition-colors">
                    {r.isPublic ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => remove(r.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      <div className="flex items-start gap-3 bg-brand-teal/5 border border-brand-teal/15 rounded-xl p-4">
        <MessageSquare size={16} className="text-brand-teal shrink-0 mt-0.5" />
        <p className="text-slate-500 text-xs font-body leading-relaxed">
          <strong className="text-brand-navy">¿Cómo llegan las opiniones?</strong> Cuando marcas una cita como completada, el cliente recibe un correo con un link para dejar su opinión. También puedes compartir el link manualmente.
        </p>
      </div>
    </div>
  );
}
