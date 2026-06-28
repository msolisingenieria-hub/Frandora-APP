"use client";

import { useState, useEffect } from "react";
import { X, User, Scissors, Clock, CalendarDays, FileText, Download, ExternalLink } from "lucide-react";
import type { AppointmentListItem } from "@/lib/services/appointment.service";
import { buildGoogleCalendarUrl } from "@/lib/services/calendar-export.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Props = {
  appointment: AppointmentListItem | null;
  slotStart?:  Date | null;
  slotEnd?:    Date | null;
  onClose:     () => void;
  onUpdated?:  () => void;
  onCharge?:   (appt: AppointmentListItem) => void;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:     { label: "Pendiente",   color: "bg-amber-100 text-amber-700" },
  CONFIRMED:   { label: "Confirmada",  color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "En curso",    color: "bg-brand-teal/10 text-brand-teal" },
  COMPLETED:   { label: "Completada",  color: "bg-emerald-100 text-emerald-700" },
  CANCELED:    { label: "Cancelada",   color: "bg-slate-100 text-slate-500" },
  NO_SHOW:     { label: "No asistió",  color: "bg-red-100 text-red-600" },
};

export function AppointmentModal({ appointment, onClose, onUpdated, onCharge }: Props) {
  const [status, setStatus]   = useState(appointment?.status ?? "PENDING");
  const [notes,  setNotes]    = useState(appointment?.internalNotes ?? "");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status);
      setNotes(appointment.internalNotes ?? "");
    }
  }, [appointment]);

  if (!appointment) return null;

  const start = new Date(appointment.startTime);
  const end   = new Date(appointment.endTime);

  const googleUrl = buildGoogleCalendarUrl({
    uid:         appointment.bookingCode,
    summary:     `${appointment.services[0]?.name ?? "Cita"} — ${appointment.businessName ?? ""}`,
    start,
    end,
  });

  async function saveChanges() {
    if (!appointment) return;
    setSaving(true);
    await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, internalNotes: notes }),
    });
    setSaving(false);
    onUpdated?.();
    onClose();
  }

  async function downloadIcs() {
    window.open(`/api/appointments/${appointment!.id}/ics?code=${appointment!.bookingCode}`, "_blank");
  }

  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-0 md:px-4"
      style={{ background: "rgba(13,27,42,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <CalendarDays size={16} className="text-brand-teal" />
            </div>
            <div>
              <p className="font-sans font-bold text-brand-navy text-sm">Detalle de cita</p>
              <p className="text-[11px] font-body text-slate-400">#{appointment.bookingCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-brand-navy transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Cliente y servicio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <User size={11} className="text-slate-400" />
                <span className="text-[10px] font-body text-slate-400 uppercase tracking-wide">Cliente</span>
              </div>
              <p className="font-sans font-semibold text-brand-navy text-sm">{appointment.clientName ?? "—"}</p>
              {appointment.clientPhone && <p className="text-xs text-slate-400 font-body">{appointment.clientPhone}</p>}
            </div>
            <div className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Scissors size={11} className="text-slate-400" />
                <span className="text-[10px] font-body text-slate-400 uppercase tracking-wide">Servicio</span>
              </div>
              <p className="font-sans font-semibold text-brand-navy text-sm">
                {appointment.services.map(s => s.name).join(", ") || "—"}
              </p>
              {appointment.staffName && <p className="text-xs text-slate-400 font-body">{appointment.staffName}</p>}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
            <Clock size={14} className="text-brand-teal shrink-0" />
            <div>
              <p className="font-sans font-semibold text-brand-navy text-sm">
                {format(start, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </p>
              <p className="text-xs font-body text-slate-400">
                {format(start, "HH:mm")} — {format(end, "HH:mm")} · ${appointment.totalPrice.toLocaleString("es-CL")}
              </p>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="text-xs font-body text-slate-500 mb-1.5 block">Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body font-semibold focus:outline-none focus:border-brand-teal ${statusInfo.color}`}>
              {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Notas internas */}
          <div>
            <label className="text-xs font-body text-slate-500 mb-1.5 flex items-center gap-1.5">
              <FileText size={11} /> Notas internas (solo el equipo las ve)
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={3} maxLength={500}
              placeholder="Ej: cliente prefiere franja AM, alérgico a X..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal resize-none" />
          </div>

          {/* Acciones de calendario */}
          <div className="flex gap-2">
            <a href={googleUrl} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-xs font-body text-slate-500 hover:border-brand-teal hover:text-brand-teal transition-colors">
              <ExternalLink size={12} /> Google Calendar
            </a>
            <button onClick={downloadIcs}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-xs font-body text-slate-500 hover:border-brand-teal hover:text-brand-teal transition-colors">
              <Download size={12} /> Descargar .ics
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2 flex-wrap">
          <button onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-sm font-body text-slate-500 hover:text-brand-navy border border-slate-200 transition-colors">
            Cerrar
          </button>
          {onCharge && appointment && (
            <button onClick={() => onCharge(appointment)}
              className="py-2.5 px-4 rounded-xl text-sm font-sans font-semibold text-brand-navy border border-brand-teal/40 bg-brand-teal/5 hover:bg-brand-teal/10 transition-colors flex items-center gap-1.5">
              💳 Cobrar
            </button>
          )}
          <button onClick={saveChanges} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-sans font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
