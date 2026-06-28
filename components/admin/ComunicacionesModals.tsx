"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const PLAN_OPTIONS = ["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE", "ENTERPRISE"] as const;

/* ─── Modal primitives ───────────────────────────────────── */
export function ModalWrapper({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="font-sans font-semibold text-brand-navy">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-body font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function ModalActions({ loading, onClose, label }: { loading: boolean; onClose: () => void; label: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-body text-slate-600 hover:bg-slate-50">
        Cancelar
      </button>
      <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-navy py-2 text-sm font-sans font-semibold text-white disabled:opacity-50 hover:bg-brand-navy/90">
        {loading && <Loader2 size={14} className="animate-spin" />}
        {label}
      </button>
    </div>
  );
}

/* ─── Announcement form modal ────────────────────────────── */
export function AnnouncementFormModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", type: "BANNER",
    targetPlans: [] as string[], ctaLabel: "", ctaUrl: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ctaLabel: form.ctaLabel || null, ctaUrl: form.ctaUrl || null }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Anuncio publicado correctamente");
      router.refresh();
      onClose();
    } else {
      toast.error("No se pudo publicar el anuncio. Intenta de nuevo.");
    }
  }

  function togglePlan(p: string) {
    setForm((f) => ({
      ...f,
      targetPlans: f.targetPlans.includes(p) ? f.targetPlans.filter((x) => x !== p) : [...f.targetPlans, p],
    }));
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
              <button key={p} type="button" onClick={() => togglePlan(p)}
                className={`rounded-full px-3 py-1 text-xs font-sans font-medium transition-colors ${form.targetPlans.includes(p) ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

/* ─── Broadcast form modal ───────────────────────────────── */
export function BroadcastFormModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({ subject: "", content: "", targetPlans: [] as string[] });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Borrador guardado correctamente");
      router.refresh();
      onClose();
    } else {
      toast.error("No se pudo guardar el borrador. Intenta de nuevo.");
    }
  }

  function togglePlan(p: string) {
    setForm((f) => ({
      ...f,
      targetPlans: f.targetPlans.includes(p) ? f.targetPlans.filter((x) => x !== p) : [...f.targetPlans, p],
    }));
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
        {form.content && (
          <div>
            <button type="button" onClick={() => setShowPreview((v) => !v)} className="flex items-center gap-1.5 text-xs font-body text-brand-teal hover:text-brand-teal/80 transition-colors mb-2">
              {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
            </button>
            {showPreview && (
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 font-body text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">
                {form.content}
              </div>
            )}
          </div>
        )}
        <Field label="Planes objetivo (dejar vacío = todos)">
          <div className="flex flex-wrap gap-2">
            {PLAN_OPTIONS.map((p) => (
              <button key={p} type="button" onClick={() => togglePlan(p)}
                className={`rounded-full px-3 py-1 text-xs font-sans font-medium transition-colors ${form.targetPlans.includes(p) ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
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
