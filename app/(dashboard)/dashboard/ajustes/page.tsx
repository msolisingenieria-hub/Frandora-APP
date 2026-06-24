"use client";

import { useState, useEffect } from "react";
import {
  Settings2, Check, Loader2, Globe,
  Phone, Clock, Instagram, Facebook,
} from "lucide-react";

type FormData = {
  name: string; slug: string; description: string;
  phone: string; website: string; timezone: string;
  instagram: string; facebook: string; tiktok: string; whatsapp: string;
};

const EMPTY: FormData = {
  name: "", slug: "", description: "", phone: "", website: "",
  timezone: "America/Santiago", instagram: "", facebook: "", tiktok: "", whatsapp: "",
};

const TIMEZONES = [
  "America/Santiago", "America/Buenos_Aires", "America/Bogota",
  "America/Lima", "America/Mexico_City", "America/Caracas", "America/Montevideo",
];

export default function AjustesPage() {
  const [form,    setForm]    = useState<FormData>(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      if (data && !data.error) {
        setForm({
          name:      data.name        ?? "",
          slug:      data.slug        ?? "",
          description: data.description ?? "",
          phone:     data.phone       ?? "",
          website:   data.website     ?? "",
          timezone:  data.timezone    ?? "America/Santiago",
          instagram: data.instagram   ?? "",
          facebook:  data.facebook    ?? "",
          tiktok:    data.tiktok      ?? "",
          whatsapp:  data.whatsapp    ?? "",
        });
      }
      setLoading(false);
    });
  }, []);

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name:        form.name        || undefined,
      description: form.description || null,
      phone:       form.phone       || null,
      website:     form.website     || null,
      timezone:    form.timezone,
      instagram:   form.instagram   || null,
      facebook:    form.facebook    || null,
      tiktok:      form.tiktok      || null,
      whatsapp:    form.whatsapp    || null,
    };
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, id, icon: Icon, type = "text" }: { label: string; id: keyof FormData; icon?: React.ElementType; type?: string }) => (
    <div>
      <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input type={type} value={form[id]} onChange={set(id)}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy`}
        />
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen p-6 md:p-8 space-y-4"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-0.5">
            <Settings2 size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">Configuración</p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">Ajustes del negocio</h1>
        </div>

        <div className="space-y-6">
          {/* Datos básicos */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6">
            <h2 className="text-brand-navy font-sans font-semibold text-sm uppercase tracking-wider mb-5">Datos del negocio</h2>
            <div className="space-y-4">
              <Field label="Nombre del negocio *" id="name" />
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  URL pública (slug)
                </label>
                <div className="flex items-center gap-0 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <span className="px-3 py-2.5 text-xs text-slate-400 font-body border-r border-slate-200 whitespace-nowrap bg-slate-100">
                    slug.frandora.cl/
                  </span>
                  <input type="text" value={form.slug} onChange={set("slug")}
                    className="flex-1 px-3 py-2.5 text-sm bg-slate-50 font-body text-brand-navy focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={set("description")} rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 font-body text-brand-navy resize-none" />
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6">
            <h2 className="text-brand-navy font-sans font-semibold text-sm uppercase tracking-wider mb-5">Contacto</h2>
            <div className="space-y-4">
              <Field label="Teléfono / WhatsApp de contacto" id="phone" icon={Phone} />
              <Field label="Sitio web" id="website" icon={Globe} />
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Clock size={12} className="inline mr-1" />Zona horaria
                </label>
                <select value={form.timezone} onChange={set("timezone")}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 font-body text-brand-navy">
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Redes sociales */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6">
            <h2 className="text-brand-navy font-sans font-semibold text-sm uppercase tracking-wider mb-5">Redes sociales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Instagram" id="instagram" icon={Instagram} />
              <Field label="Facebook" id="facebook" icon={Facebook} />
              <Field label="TikTok" id="tiktok" />
              <Field label="WhatsApp Business" id="whatsapp" icon={Phone} />
            </div>
          </section>

          {/* URL pública */}
          <section className="rounded-2xl p-5 border border-brand-navy/15 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3347 100%)" }}>
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(111,168,158,0.2) 0%, transparent 70%)" }} />
            <p className="text-brand-teal text-xs tracking-[0.15em] uppercase font-sans font-semibold mb-1 relative z-10">Tu página pública de reservas</p>
            <p className="text-white font-sans font-semibold text-sm relative z-10">{form.slug || "tunegocio"}.frandora.cl</p>
            <p className="text-white/40 text-xs font-body mt-1 relative z-10">
              Los clientes reservan 24/7 desde esta URL. Compártela en redes sociales.
            </p>
          </section>

          {/* Guardar */}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
            {saving ? (
              <><Loader2 size={16} className="animate-spin" />Guardando...</>
            ) : saved ? (
              <><Check size={16} className="text-brand-teal" />¡Cambios guardados!</>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
