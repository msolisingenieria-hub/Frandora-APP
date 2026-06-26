"use client";

import { useState } from "react";
import { X, Save, Check } from "lucide-react";

const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

type DaySchedule = { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean };

type Props = {
  staffId: string;
  staffName: string;
  initial: DaySchedule[];
  onClose: () => void;
  onSaved: () => void;
};

function defaultSchedule(): DaySchedule[] {
  return DAYS.map((_, i) => ({
    dayOfWeek:   i + 1,
    startTime:   "09:00",
    endTime:     "18:00",
    isAvailable: i < 5,
  }));
}

export function StaffScheduleModal({ staffId, staffName, initial, onClose, onSaved }: Props) {
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    initial.length > 0 ? initial : defaultSchedule()
  );
  const [saving, setSaving] = useState(false);

  function toggle(idx: number) {
    setSchedules(s => s.map((d, i) => i === idx ? { ...d, isAvailable: !d.isAvailable } : d));
  }
  function setTime(idx: number, key: "startTime"|"endTime", val: string) {
    setSchedules(s => s.map((d, i) => i === idx ? { ...d, [key]: val } : d));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/staff/${staffId}/schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedules.filter(d => d.isAvailable)),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-sans font-bold text-brand-navy text-sm">Horario de {staffName}</h2>
            <p className="text-xs font-body text-slate-400">Define los días y horas de atención</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-2.5">
          {schedules.map((day, idx) => (
            <div key={day.dayOfWeek}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${day.isAvailable ? "border-brand-teal/20 bg-slate-50" : "border-slate-100 opacity-50"}`}>
              <button type="button" onClick={() => toggle(idx)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${day.isAvailable ? "bg-brand-navy border-brand-navy" : "border-slate-300"}`}>
                {day.isAvailable && <Check size={10} strokeWidth={3} className="text-white" />}
              </button>
              <span className="text-sm font-body text-brand-navy w-20 shrink-0">{DAYS[idx]}</span>
              {day.isAvailable ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={day.startTime} onChange={e => setTime(idx, "startTime", e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal" />
                  <span className="text-slate-300 text-xs">—</span>
                  <input type="time" value={day.endTime} onChange={e => setTime(idx, "endTime", e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-body text-brand-navy bg-white focus:outline-none focus:border-brand-teal" />
                </div>
              ) : (
                <span className="text-xs font-body text-slate-400 flex-1">No disponible</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end p-5 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-body text-slate-500">Cancelar</button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-sans font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
            <Save size={14} /> {saving ? "Guardando…" : "Guardar horario"}
          </button>
        </div>
      </div>
    </div>
  );
}
