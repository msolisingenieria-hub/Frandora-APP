"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Megaphone, Mail, Trash2, Loader2, CheckCircle, Clock } from "lucide-react";
import type { Announcement, BroadcastEmail } from "@prisma/client";

const TYPE_STYLES: Record<string, string> = {
  BANNER: "bg-blue-100 text-blue-700",
  CHANGELOG: "bg-purple-100 text-purple-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  PROMOTION: "bg-emerald-100 text-emerald-700",
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

export function ComunicacionesClient({ announcements, broadcasts }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"banners" | "emails">("banners");
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function toggleAnnouncement(id: string, isActive: boolean) {
    await fetch(`/api/admin/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("¿Eliminar este anuncio?")) return;
    setDeleting(id);
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 mb-6 w-fit">
        {(["banners", "emails"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-sans font-medium transition-colors ${tab === t ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t === "banners" ? <Megaphone size={14} /> : <Mail size={14} />}
            {t === "banners" ? "Banners y anuncios" : "Emails broadcast"}
          </button>
        ))}
      </div>

      {/* Banners Tab */}
      {tab === "banners" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-sm text-slate-500">{announcements.length} anuncio{announcements.length !== 1 ? "s" : ""}</p>
            <button onClick={() => setShowAnnounceForm(true)} className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-sm font-sans font-semibold text-white hover:bg-navy/90">
              <Plus size={14} /> Nuevo anuncio
            </button>
          </div>

          {announcements.length === 0 ? (
            <EmptyState icon={<Megaphone size={28} />} text="Sin anuncios activos" sub="Crea un banner para que aparezca en el panel de todos los negocios." />
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className={`rounded-xl border p-5 ${a.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-body font-medium ${TYPE_STYLES[a.type]}`}>
                          {TYPE_LABELS[a.type]}
                        </span>
                        {a.isActive ? (
                          <span className="flex items-center gap-1 text-[11px] font-body text-emerald-600"><CheckCircle size={10} /> Activo</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-body text-slate-400"><Clock size={10} /> Inactivo</span>
                        )}
                      </div>
                      <p className="font-sans font-semibold text-navy text-sm">{a.title}</p>
                      <p className="font-body text-sm text-slate-500 mt-0.5 line-clamp-2">{a.content}</p>
                      {a.targetPlans.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {a.targetPlans.map((p) => (
                            <span key={p} className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-body text-navy">
                              {p.charAt(0) + p.slice(1).toLowerCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleAnnouncement(a.id, a.isActive)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-sans font-medium transition-colors ${a.isActive ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                      >
                        {a.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(a.id)}
                        disabled={deleting === a.id}
                        className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"
                      >
                        {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emails Tab */}
      {tab === "emails" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-sm text-slate-500">{broadcasts.length} email{broadcasts.length !== 1 ? "s" : ""}</p>
            <button onClick={() => setShowBroadcastForm(true)} className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-sm font-sans font-semibold text-white hover:bg-navy/90">
              <Plus size={14} /> Nuevo email
            </button>
          </div>

          {broadcasts.length === 0 ? (
            <EmptyState icon={<Mail size={28} />} text="Sin emails programados" sub="Envía comunicados a todos los negocios o solo a ciertos planes." />
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-sans font-semibold text-navy text-sm">{b.subject}</p>
                      <p className="font-body text-xs text-slate-400 mt-0.5">
                        {b.status === "SENT" ? `Enviado: ${b.sentCount} negocios` : b.status === "SCHEDULED" ? `Programado` : "Borrador"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-body font-medium ${b.status === "SENT" ? "bg-emerald-100 text-emerald-700" : b.status === "SCHEDULED" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
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

function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
      <div className="mb-3 text-slate-300">{icon}</div>
      <p className="font-sans font-semibold text-slate-600">{text}</p>
      <p className="mt-1 font-body text-sm text-slate-400">{sub}</p>
    </div>
  );
}

const PLAN_OPTIONS = ["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE", "ENTERPRISE"] as const;

function AnnouncementFormModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "BANNER", targetPlans: [] as string[], ctaLabel: "", ctaUrl: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ctaLabel: form.ctaLabel || null, ctaUrl: form.ctaUrl || null }),
    });
    setLoading(false);
    router.refresh();
    onClose();
  }

  return (
    <ModalWrapper title="Nuevo anuncio" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Tipo">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
            <option value="BANNER">Banner informativo</option>
            <option value="CHANGELOG">Novedad / Changelog</option>
            <option value="MAINTENANCE">Mantenimiento</option>
            <option value="PROMOTION">Promoción</option>
          </select>
        </Field>
        <Field label="Título">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-field" placeholder="Ej: Nueva función de reportes disponible" />
        </Field>
        <Field label="Contenido">
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={3} className="input-field resize-none" placeholder="Describe el anuncio..." />
        </Field>
        <Field label="Planes objetivo (dejar vacío = todos)">
          <div className="flex flex-wrap gap-2">
            {PLAN_OPTIONS.map((p) => (
              <button key={p} type="button"
                onClick={() => setForm((f) => ({ ...f, targetPlans: f.targetPlans.includes(p) ? f.targetPlans.filter((x) => x !== p) : [...f.targetPlans, p] }))}
                className={`rounded-full px-3 py-1 text-xs font-sans font-medium ${form.targetPlans.includes(p) ? "bg-navy text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Texto del botón (opcional)">
            <input type="text" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className="input-field" placeholder="Ver más" />
          </Field>
          <Field label="URL del botón">
            <input type="url" value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} className="input-field" placeholder="https://..." />
          </Field>
        </div>
        <ModalActions loading={loading} onClose={onClose} label="Publicar anuncio" />
      </form>
    </ModalWrapper>
  );
}

function BroadcastFormModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: "", content: "", targetPlans: [] as string[] });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    router.refresh();
    onClose();
  }

  return (
    <ModalWrapper title="Nuevo email broadcast" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Asunto del email">
          <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="input-field" placeholder="Ej: Novedades de junio en Frandora" />
        </Field>
        <Field label="Contenido">
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={5} className="input-field resize-none" placeholder="Escribe el mensaje del email..." />
        </Field>
        <Field label="Planes objetivo (dejar vacío = todos)">
          <div className="flex flex-wrap gap-2">
            {PLAN_OPTIONS.map((p) => (
              <button key={p} type="button"
                onClick={() => setForm((f) => ({ ...f, targetPlans: f.targetPlans.includes(p) ? f.targetPlans.filter((x) => x !== p) : [...f.targetPlans, p] }))}
                className={`rounded-full px-3 py-1 text-xs font-sans font-medium ${form.targetPlans.includes(p) ? "bg-navy text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </Field>
        <p className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs font-body text-amber-700">
          El email se guarda como borrador. Desde aquí puedes enviarlo o programarlo para después.
        </p>
        <ModalActions loading={loading} onClose={onClose} label="Guardar borrador" />
      </form>
    </ModalWrapper>
  );
}

function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="font-sans font-semibold text-navy">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-body font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ loading, onClose, label }: { loading: boolean; onClose: () => void; label: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-body text-slate-600 hover:bg-slate-50">Cancelar</button>
      <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-navy py-2 text-sm font-sans font-semibold text-white disabled:opacity-50 hover:bg-navy/90">
        {loading && <Loader2 size={14} className="animate-spin" />}
        {label}
      </button>
    </div>
  );
}
