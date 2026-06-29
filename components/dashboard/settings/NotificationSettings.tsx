"use client";

import { SectionCard, ToggleRow } from "./SettingsPrimitives";
import type { SettingsForm, SettingsField } from "@/types/settings";

export function NotificationSettings({ form, set }: { form: SettingsForm; set: (k: SettingsField, v: string | boolean | number | null) => void }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Canales de aviso" description="Por dónde se envían las notificaciones a tus clientes">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="Correo electrónico" description="Confirmaciones y recordatorios por email"
            checked={form.emailEnabled} onChange={(v) => set("emailEnabled", v)} />
          <ToggleRow label="SMS" description="Mensajes de texto (requiere plan Professional+)"
            checked={form.smsEnabled} onChange={(v) => set("smsEnabled", v)} />
          <ToggleRow label="WhatsApp" description="Mensajes por WhatsApp (requiere plan Professional+)"
            checked={form.whatsappEnabled} onChange={(v) => set("whatsappEnabled", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Recordatorios de citas">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="Recordatorio 24 horas antes" description="Reduce las inasistencias"
            checked={form.reminder24h} onChange={(v) => set("reminder24h", v)} />
          <ToggleRow label="Recordatorio 2 horas antes" description="Aviso de último minuto"
            checked={form.reminder1h} onChange={(v) => set("reminder1h", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Después de la cita">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="Pedir reseña al cliente" description="Solicita una opinión tras completar el servicio"
            checked={form.reviewRequestEnabled} onChange={(v) => set("reviewRequestEnabled", v)} />
        </div>
      </SectionCard>
    </div>
  );
}
