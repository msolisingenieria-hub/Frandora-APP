"use client";

import { useState, useEffect, useMemo } from "react";
import { format, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { X, Loader2, Check, Clock, User } from "lucide-react";
import type { AgendaStaff } from "@/types/agenda";

interface Service { id: string; name: string; duration: number; price: number; }

interface Props {
  staff:        AgendaStaff[];
  selectedDate: Date;
  onClose:      () => void;
  onCreated:    () => void;
}

const DEFAULT_OPEN = "09:00";
const DEFAULT_CLOSE = "18:00";
const SLOT_STEP = 30; // minutos

function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function toLabel(min: number) { return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`; }

// Genera horarios disponibles según el horario del profesional para ese día
function generateSlots(staff: AgendaStaff | undefined, date: Date, takenStarts: Set<string>): string[] {
  const dow = getDay(date);
  const sched = staff?.schedules?.find((s) => s.dayOfWeek === dow && s.isAvailable);
  const open  = sched ? toMin(sched.startTime) : toMin(DEFAULT_OPEN);
  const close = sched ? toMin(sched.endTime)   : toMin(DEFAULT_CLOSE);
  const slots: string[] = [];
  for (let m = open; m < close; m += SLOT_STEP) {
    const label = toLabel(m);
    if (!takenStarts.has(label)) slots.push(label);
  }
  return slots;
}

export function CreateAppointmentModal({ staff, selectedDate, onClose, onCreated }: Props) {
  const [services, setServices]   = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [staffId,   setStaffId]   = useState(staff[0]?.id ?? "");
  const [date,      setDate]      = useState(format(selectedDate, "yyyy-MM-dd"));
  const [time,      setTime]      = useState("");
  const [taken,     setTaken]     = useState<Set<string>>(new Set());
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    fetch("/api/services").then((r) => r.ok ? r.json() : []).then((d) => {
      const list = Array.isArray(d) ? d : (d?.services ?? []);
      setServices(list);
      if (list[0]) setServiceId(list[0].id);
    }).catch(() => {});
  }, []);

  // Cargar horas ya tomadas del profesional ese día
  useEffect(() => {
    if (!staffId || !date) return;
    fetch(`/api/appointments?from=${date}T00:00:00.000Z&to=${date}T23:59:59.999Z`)
      .then((r) => r.ok ? r.json() : [])
      .then((appts) => {
        const set = new Set<string>();
        (Array.isArray(appts) ? appts : []).forEach((a: { staffId?: string; startTime: string }) => {
          if (a.staffId === staffId) set.add(format(new Date(a.startTime), "HH:mm"));
        });
        setTaken(set);
        setTime("");
      }).catch(() => {});
  }, [staffId, date]);

  const selectedStaff = staff.find((s) => s.id === staffId);
  const slots = useMemo(() => generateSlots(selectedStaff, new Date(date + "T12:00:00"), taken), [selectedStaff, date, taken]);
  const service = services.find((s) => s.id === serviceId);

  async function handleCreate() {
    if (!serviceId || !staffId || !time || !clientName.trim()) {
      setError("Completa servicio, profesional, hora y nombre del cliente.");
      return;
    }
    setSaving(true);
    setError("");
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date + "T00:00:00"); start.setHours(h, m, 0, 0);
    const dur = service?.duration ?? 60;
    const end = new Date(start.getTime() + dur * 60000);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId, serviceId, clientName: clientName.trim(), clientPhone: clientPhone.trim() || undefined,
          startTime: start.toISOString(), endTime: end.toISOString(), status: "CONFIRMED",
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "No se pudo crear la reserva");
      onCreated();
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white w-full sm:max-w-md h-full overflow-y-auto animate-slide-in-right shadow-brand-lg">

        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-sans font-bold text-brand-navy text-base">Nueva reserva</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Servicio */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-500 mb-1.5">Servicio</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal">
              {services.length === 0 && <option value="">Sin servicios — créalos primero</option>}
              {services.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.duration}min · ${Number(s.price).toLocaleString("es-CL")}</option>)}
            </select>
          </div>

          {/* Profesional */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-500 mb-1.5">Profesional</label>
            <div className="grid grid-cols-2 gap-2">
              {staff.map((s) => (
                <button key={s.id} type="button" onClick={() => setStaffId(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${staffId === s.id ? "border-brand-navy bg-brand-navy text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: s.color ?? "#6FA89E", color: "#fff" }}>{s.name[0]}</span>
                  <span className="text-xs font-sans font-semibold truncate">{s.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-500 mb-1.5">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            <p className="text-[11px] font-body text-slate-400 mt-1 capitalize">{format(new Date(date + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es })}</p>
          </div>

          {/* Horarios disponibles */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <Clock size={12} /> Horarios disponibles de {selectedStaff?.name.split(" ")[0] ?? "—"}
            </label>
            {slots.length === 0 ? (
              <p className="text-xs font-body text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                No hay horarios disponibles este día. Configura el horario del profesional en Equipo.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto">
                {slots.map((slot) => (
                  <button key={slot} type="button" onClick={() => setTime(slot)}
                    className={`py-2 rounded-lg text-xs font-sans font-semibold transition-all ${time === slot ? "bg-brand-teal text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <label className="block text-xs font-sans font-semibold text-slate-500 flex items-center gap-1"><User size={12} /> Cliente</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Teléfono (opcional)"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
          </div>

          {error && <p className="text-sm text-rose-600 font-body">{error}</p>}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4">
          <button onClick={handleCreate} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-sans font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
            {saving ? <><Loader2 size={15} className="animate-spin" />Creando...</> : <><Check size={15} />Crear reserva</>}
          </button>
        </div>
      </div>
    </div>
  );
}
