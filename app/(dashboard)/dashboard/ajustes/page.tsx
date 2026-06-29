"use client";

import { useState, useEffect } from "react";
import { Settings2, Check, Loader2, Building2, ShieldCheck, Bell, ExternalLink } from "lucide-react";
import { GeneralSettings }      from "@/components/dashboard/settings/GeneralSettings";
import { PolicySettings }       from "@/components/dashboard/settings/PolicySettings";
import { NotificationSettings } from "@/components/dashboard/settings/NotificationSettings";
import { EMPTY_SETTINGS } from "@/types/settings";
import type { SettingsForm, SettingsField } from "@/types/settings";

const TABS = [
  { key: "general",       label: "Negocio",        icon: Building2   },
  { key: "policies",      label: "Reservas",       icon: ShieldCheck },
  { key: "notifications", label: "Notificaciones", icon: Bell        },
] as const;
type TabKey = typeof TABS[number]["key"];

export default function AjustesPage() {
  const [tab,     setTab]     = useState<TabKey>("general");
  const [form,    setForm]    = useState<SettingsForm>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d && !d.error) {
        setForm({
          name: d.name ?? "", slug: d.slug ?? "", description: d.description ?? "",
          logoUrl: d.logoUrl ?? null, phone: d.phone ?? "",
          website: d.website ?? "", timezone: d.timezone ?? "America/Santiago", currency: d.currency ?? "CLP",
          instagram: d.instagram ?? "", facebook: d.facebook ?? "", tiktok: d.tiktok ?? "", whatsapp: d.whatsapp ?? "",
          bookingAdvanceDays: d.bookingAdvanceDays ?? 60, minCancelHours: d.minCancelHours ?? 24,
          bufferMinutes: d.bufferMinutes ?? 0, depositPercent: d.depositPercent ?? 0,
          requirePayment: d.requirePayment ?? false, autoConfirm: d.autoConfirm ?? true,
          allowClientCancel: d.allowClientCancel ?? true, allowClientReschedule: d.allowClientReschedule ?? true,
          emailEnabled: d.emailEnabled ?? true, smsEnabled: d.smsEnabled ?? false, whatsappEnabled: d.whatsappEnabled ?? false,
          reminder24h: d.reminder24h ?? true, reminder1h: d.reminder1h ?? false, reviewRequestEnabled: d.reviewRequestEnabled ?? true,
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (k: SettingsField, v: string | boolean | number | null) => {
    setForm((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        description: form.description || null, phone: form.phone || null, website: form.website || null,
        logoUrl: form.logoUrl,
        instagram: form.instagram || null, facebook: form.facebook || null, tiktok: form.tiktok || null, whatsapp: form.whatsapp || null,
        slug: form.slug || undefined, name: form.name || undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(typeof d?.error === "string" ? d.error : "No se pudieron guardar los cambios");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return (
    <div className="min-h-screen p-6 space-y-4" style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />)}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <Settings2 size={16} className="text-brand-teal" />
            <p className="text-brand-teal text-[11px] font-sans font-semibold tracking-[0.18em] uppercase">Configuración</p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl tracking-tight">Ajustes del negocio</h1>
        </div>

        {/* URL pública */}
        {form.slug && (
          <a href={`https://${form.slug}.frandora.cl`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl p-3 mb-5 border border-brand-navy/15 relative overflow-hidden group"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3347 100%)" }}>
            <div className="relative z-10 min-w-0">
              <p className="text-brand-teal text-[10px] tracking-[0.15em] uppercase font-sans font-semibold">Tu página pública</p>
              <p className="text-white font-sans font-semibold text-sm truncate">{form.slug}.frandora.cl</p>
            </div>
            <ExternalLink size={15} className="text-white/50 group-hover:text-brand-teal transition-colors flex-shrink-0 relative z-10" />
          </a>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${tab === key ? "bg-white text-brand-navy shadow-sm" : "text-slate-500 hover:text-brand-navy"}`}>
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Contenido del tab */}
        <div className="animate-fade-in">
          {tab === "general"       && <GeneralSettings form={form} set={set} />}
          {tab === "policies"      && <PolicySettings form={form} set={set} />}
          {tab === "notifications" && <NotificationSettings form={form} set={set} />}
        </div>

        {/* Guardar (sticky) */}
        <div className="sticky bottom-4 mt-5">
          {error && <p className="text-sm text-rose-600 font-body text-center mb-2 bg-white/90 rounded-lg py-2">{error}</p>}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:opacity-60 shadow-brand-lg"
            style={{ background: saved ? "linear-gradient(135deg, #16a34a, #15803d)" : "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
            {saving ? <><Loader2 size={16} className="animate-spin" />Guardando...</>
              : saved ? <><Check size={16} />¡Cambios guardados!</>
              : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}
