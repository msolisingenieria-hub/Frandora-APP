"use client";

import { Phone, Globe, Instagram, Facebook, Clock } from "lucide-react";
import { SectionCard, TextField } from "./SettingsPrimitives";
import { LogoUploader } from "./LogoUploader";
import type { SettingsForm, SettingsField } from "@/types/settings";

const TIMEZONES = [
  "America/Santiago", "America/Buenos_Aires", "America/Bogota",
  "America/Lima", "America/Mexico_City", "America/Caracas", "America/Montevideo",
];
const CURRENCIES = [
  { v: "CLP", l: "Peso chileno (CLP)" }, { v: "USD", l: "Dólar (USD)" },
  { v: "MXN", l: "Peso mexicano (MXN)" }, { v: "ARS", l: "Peso argentino (ARS)" },
  { v: "COP", l: "Peso colombiano (COP)" }, { v: "PEN", l: "Sol peruano (PEN)" },
];

export function GeneralSettings({ form, set }: { form: SettingsForm; set: (k: SettingsField, v: string | boolean | number | null) => void }) {
  const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="space-y-5">
      <SectionCard title="Identidad del negocio" description="Cómo te ven tus clientes en la página de reservas">
        <div className="space-y-4">
          <LogoUploader value={form.logoUrl} onChange={(url) => set("logoUrl", url)} />
          <TextField label="Nombre del negocio" value={form.name} onChange={(v) => set("name", v)} />
          <TextField label="Dirección web pública" value={form.slug} onChange={(v) => set("slug", slugify(v))} prefix="https://" />
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-500 mb-1.5">Descripción</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
              placeholder="Cuéntales a tus clientes qué hace especial a tu negocio"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy resize-none transition-colors" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contacto y ubicación">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Teléfono" value={form.phone} onChange={(v) => set("phone", v)} icon={Phone} placeholder="+56 9 xxxx xxxx" />
          <TextField label="Sitio web" value={form.website} onChange={(v) => set("website", v)} icon={Globe} placeholder="https://minegocio.cl" />
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-500 mb-1.5"><Clock size={12} className="inline mr-1" />Zona horaria</label>
            <select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 font-body text-brand-navy transition-colors">
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-500 mb-1.5">Moneda</label>
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 font-body text-brand-navy transition-colors">
              {CURRENCIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Redes sociales" description="Aparecen en tu página pública de reservas">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} icon={Instagram} placeholder="@minegocio" />
          <TextField label="Facebook" value={form.facebook} onChange={(v) => set("facebook", v)} icon={Facebook} placeholder="facebook.com/minegocio" />
          <TextField label="TikTok" value={form.tiktok} onChange={(v) => set("tiktok", v)} placeholder="@minegocio" />
          <TextField label="WhatsApp" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} icon={Phone} placeholder="+56 9 xxxx xxxx" />
        </div>
      </SectionCard>
    </div>
  );
}
