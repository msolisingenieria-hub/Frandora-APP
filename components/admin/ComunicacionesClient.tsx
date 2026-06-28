"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Megaphone, Mail, Trash2, Loader2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { AnnouncementFormModal, BroadcastFormModal } from "@/components/admin/ComunicacionesModals";
import type { Announcement, BroadcastEmail } from "@prisma/client";

/* ─── Type helpers ───────────────────────────────────────── */
const TYPE_BORDER: Record<string, string> = {
  BANNER: "border-l-blue-500",
  CHANGELOG: "border-l-purple-500",
  MAINTENANCE: "border-l-amber-500",
  PROMOTION: "border-l-green-500",
};

const TYPE_BADGE: Record<string, string> = {
  BANNER: "bg-blue-100 text-blue-700",
  CHANGELOG: "bg-purple-100 text-purple-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  PROMOTION: "bg-green-100 text-green-700",
};

const TYPE_LABELS: Record<string, string> = {
  BANNER: "Banner",
  CHANGELOG: "Novedad",
  MAINTENANCE: "Mantenimiento",
  PROMOTION: "Promoción",
};

interface Props {
  announcements: Announcement[];
  broadcasts: BroadcastEmail[];
}

/* ─── KPI header ─────────────────────────────────────────── */
function KpiBar({ announcements, broadcasts }: Props) {
  const active = announcements.filter((a) => a.isActive).length;
  const sent = broadcasts.filter((b) => b.status === "SENT");
  const lastSent = sent.length > 0 ? sent[sent.length - 1] : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-brand-sm">
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal mb-1">
          Anuncios activos
        </p>
        <p className="font-sans font-bold text-2xl text-brand-navy">{active}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-brand-sm">
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal mb-1">
          Emails enviados
        </p>
        <p className="font-sans font-bold text-2xl text-brand-navy">{sent.length}</p>
      </div>
      <div className="col-span-2 md:col-span-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-brand-sm">
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal mb-1">
          Último broadcast
        </p>
        <p className="font-body text-sm text-slate-600 truncate">
          {lastSent ? lastSent.subject : <span className="text-slate-400 italic">Ninguno aún</span>}
        </p>
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────── */
function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 md:p-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
        {icon}
      </div>
      <p className="font-sans font-semibold text-slate-600">{text}</p>
      <p className="mt-1 font-body text-sm text-slate-400 max-w-xs">{sub}</p>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export function ComunicacionesClient({ announcements, broadcasts }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"banners" | "emails">("banners");
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function toggleAnnouncement(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) {
      toast.success(isActive ? "Anuncio desactivado" : "Anuncio activado");
      router.refresh();
    } else {
      toast.error("No se pudo actualizar el anuncio.");
    }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("¿Eliminar este anuncio?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      toast.success("Anuncio eliminado");
      router.refresh();
    } else {
      toast.error("No se pudo eliminar el anuncio.");
    }
  }

  return (
    <>
      {/* KPIs */}
      <KpiBar announcements={announcements} broadcasts={broadcasts} />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 mb-6 w-fit">
        {(["banners", "emails"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-sans font-medium transition-all duration-150 ${
              tab === t ? "bg-white text-brand-navy shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "banners" ? <Megaphone size={14} /> : <Mail size={14} />}
            <span>{t === "banners" ? "Anuncios" : "Emails"}</span>
            {tab === t && (
              <span className="ml-0.5 rounded-full bg-brand-teal/20 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-brand-teal">
                {t === "banners" ? announcements.length : broadcasts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="border-t border-slate-100 mb-5" />

      {/* ── Banners tab ── */}
      {tab === "banners" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal">
                Anuncios en panel
              </p>
              <p className="font-body text-sm text-slate-500">
                {announcements.length} anuncio{announcements.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setShowAnnounceForm(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-sans font-semibold text-white hover:bg-brand-navy/90 transition-colors"
            >
              <Plus size={14} /> Nuevo anuncio
            </button>
          </div>

          {announcements.length === 0 ? (
            <EmptyState
              icon={<Megaphone size={28} />}
              text="Sin anuncios activos"
              sub="Crea un banner para que aparezca en el panel de todos los negocios."
            />
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-xl border border-l-4 ${TYPE_BORDER[a.type] ?? "border-l-slate-300"} p-4 md:p-5 transition-all duration-200 ${
                    a.isActive
                      ? "border-slate-200 bg-white shadow-brand-sm"
                      : "border-slate-100 bg-slate-50/60 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-body font-medium ${TYPE_BADGE[a.type]}`}>
                          {TYPE_LABELS[a.type]}
                        </span>
                        {a.isActive ? (
                          <span className="flex items-center gap-1 text-[11px] font-body text-emerald-600">
                            <CheckCircle size={10} /> Activo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-body text-slate-400">
                            <Clock size={10} /> Inactivo
                          </span>
                        )}
                      </div>
                      <p className="font-sans font-semibold text-brand-navy text-sm">{a.title}</p>
                      <p className="font-body text-sm text-slate-500 mt-0.5 line-clamp-2">{a.content}</p>
                      {a.targetPlans.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {a.targetPlans.map((p) => (
                            <span key={p} className="rounded-full bg-brand-navy/10 px-2 py-0.5 text-[11px] font-body text-brand-navy">
                              {p.charAt(0) + p.slice(1).toLowerCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleAnnouncement(a.id, a.isActive)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-sans font-medium transition-colors ${
                          a.isActive
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        }`}
                      >
                        {a.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(a.id)}
                        disabled={deleting === a.id}
                        className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        {deleting === a.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Emails tab ── */}
      {tab === "emails" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal">
                Emails masivos
              </p>
              <p className="font-body text-sm text-slate-500">
                {broadcasts.length} email{broadcasts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setShowBroadcastForm(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-sans font-semibold text-white hover:bg-brand-navy/90 transition-colors"
            >
              <Plus size={14} /> Nuevo email
            </button>
          </div>

          {broadcasts.length === 0 ? (
            <EmptyState
              icon={<Mail size={28} />}
              text="Sin emails programados"
              sub="Envía comunicados a todos los negocios o solo a ciertos planes."
            />
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-brand-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-sans font-semibold text-brand-navy text-sm truncate">{b.subject}</p>
                      <p className="font-body text-xs text-slate-400 mt-0.5">
                        {b.status === "SENT"
                          ? `Enviado · ${b.sentCount} negocios`
                          : b.status === "SCHEDULED"
                          ? "Programado"
                          : "Borrador"}
                      </p>
                      {b.status === "DRAFT" && b.content && (
                        <div className="mt-3 rounded-xl border border-slate-200 p-3 bg-slate-50 font-body text-xs whitespace-pre-wrap text-slate-600 line-clamp-3 leading-relaxed">
                          {b.content}
                        </div>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-body font-medium ${
                      b.status === "SENT"
                        ? "bg-emerald-100 text-emerald-700"
                        : b.status === "SCHEDULED"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {b.status === "SENT" ? "Enviado" : b.status === "SCHEDULED" ? "Programado" : "Borrador"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAnnounceForm && <AnnouncementFormModal onClose={() => setShowAnnounceForm(false)} />}
      {showBroadcastForm && <BroadcastFormModal onClose={() => setShowBroadcastForm(false)} />}
    </>
  );
}
