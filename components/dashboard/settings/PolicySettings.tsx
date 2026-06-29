"use client";

import { SectionCard, ToggleRow, NumberStepper } from "./SettingsPrimitives";
import type { SettingsForm, SettingsField } from "@/types/settings";

export function PolicySettings({ form, set }: { form: SettingsForm; set: (k: SettingsField, v: string | boolean | number | null) => void }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Reservas" description="Controla cómo y cuándo los clientes pueden reservar">
        <div className="divide-y divide-slate-100">
          <NumberStepper label="Anticipación máxima para reservar" value={form.bookingAdvanceDays}
            onChange={(v) => set("bookingAdvanceDays", v)} min={1} max={365} suffix="días" />
          <NumberStepper label="Tiempo entre citas" value={form.bufferMinutes}
            onChange={(v) => set("bufferMinutes", v)} min={0} max={120} step={5} suffix="min" />
          <ToggleRow label="Confirmar reservas automáticamente"
            description="Si está apagado, tú apruebas cada reserva manualmente"
            checked={form.autoConfirm} onChange={(v) => set("autoConfirm", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Cancelaciones y cambios">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="Permitir que el cliente cancele"
            description="El cliente puede cancelar desde su portal"
            checked={form.allowClientCancel} onChange={(v) => set("allowClientCancel", v)} />
          <ToggleRow label="Permitir reagendar"
            description="El cliente puede mover su cita a otro horario"
            checked={form.allowClientReschedule} onChange={(v) => set("allowClientReschedule", v)} />
          <NumberStepper label="Aviso mínimo para cancelar" value={form.minCancelHours}
            onChange={(v) => set("minCancelHours", v)} min={0} max={168} suffix="hrs" />
        </div>
      </SectionCard>

      <SectionCard title="Pagos en la reserva" description="Cobra un depósito al momento de reservar (vía Flow.cl)">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="Requerir pago al reservar"
            description="El cliente paga un depósito para confirmar"
            checked={form.requirePayment} onChange={(v) => set("requirePayment", v)} />
          {form.requirePayment && (
            <NumberStepper label="Porcentaje de depósito" value={form.depositPercent}
              onChange={(v) => set("depositPercent", v)} min={0} max={100} step={5} suffix="%" />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
