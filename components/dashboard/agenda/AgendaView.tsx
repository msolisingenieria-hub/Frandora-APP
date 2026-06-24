"use client";

import { useState, useCallback } from "react";
import { CalendarDays, Users, Clock, Code } from "lucide-react";
import { AgendaCalendar } from "@/components/dashboard/AgendaCalendar";
import { AppointmentModal } from "@/components/dashboard/agenda/AppointmentModal";
import { TimeBlockModal }    from "@/components/dashboard/agenda/TimeBlockModal";
import { ClassesPanel }      from "@/components/dashboard/agenda/ClassesPanel";
import { WaitlistPanel }     from "@/components/dashboard/agenda/WaitlistPanel";
import { WidgetPanel }       from "@/components/dashboard/agenda/WidgetPanel";
import type { AppointmentListItem } from "@/lib/services/appointment.service";

type TimeBlockItem = {
  id: string; title: string;
  startTime: Date | string; endTime: Date | string; color: string;
};

type Props = {
  appointments: AppointmentListItem[];
  timeBlocks:   TimeBlockItem[];
  businessSlug: string;
};

const TABS = [
  { key: "calendar", label: "Calendario", icon: CalendarDays },
  { key: "classes",  label: "Clases",     icon: Users },
  { key: "waitlist", label: "Lista de espera", icon: Clock },
  { key: "widget",   label: "Botón de reserva", icon: Code },
] as const;

type Tab = typeof TABS[number]["key"];

export function AgendaView({ appointments, timeBlocks, businessSlug }: Props) {
  const [tab,             setTab]             = useState<Tab>("calendar");
  const [selectedAppt,   setSelectedAppt]     = useState<AppointmentListItem | null>(null);
  const [slotStart,       setSlotStart]        = useState<Date | null>(null);
  const [slotEnd,         setSlotEnd]          = useState<Date | null>(null);
  const [showBlockModal,  setShowBlockModal]   = useState(false);
  const [localAppointments, setLocalAppointments] = useState(appointments);
  const [localBlocks,     setLocalBlocks]     = useState(timeBlocks);

  async function refreshCalendar() {
    const res = await fetch("/api/appointments?dashboard=1");
    if (res.ok) setLocalAppointments(await res.json());
    const bRes = await fetch("/api/time-blocks");
    if (bRes.ok) setLocalBlocks(await bRes.json());
  }

  const handleMoveEvent = useCallback(async (id: string, start: Date, end: Date) => {
    await fetch("/api/appointments/move", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, startTime: start.toISOString(), endTime: end.toISOString() }),
    });
    setLocalAppointments(prev => prev.map(a =>
      a.id === id ? { ...a, startTime: start, endTime: end } : a
    ));
  }, []);

  const handleSelectSlot = useCallback((start: Date, end: Date) => {
    setSlotStart(start);
    setSlotEnd(end);
    setShowBlockModal(true);
  }, []);

  return (
    <>
      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-brand overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-none">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-sans font-semibold whitespace-nowrap transition-colors shrink-0 border-b-2 -mb-px ${
                tab === key
                  ? "border-brand-navy text-brand-navy"
                  : "border-transparent text-slate-400 hover:text-brand-navy"
              }`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6">
          {tab === "calendar" && (
            <AgendaCalendar
              appointments={localAppointments}
              timeBlocks={localBlocks}
              onSelectEvent={setSelectedAppt}
              onSelectSlot={handleSelectSlot}
              onMoveEvent={handleMoveEvent}
            />
          )}
          {tab === "classes"  && <ClassesPanel />}
          {tab === "waitlist" && <WaitlistPanel />}
          {tab === "widget"   && <WidgetPanel slug={businessSlug} />}
        </div>
      </div>

      {/* Modal cita */}
      {selectedAppt && (
        <AppointmentModal
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onUpdated={refreshCalendar}
        />
      )}

      {/* Modal bloqueo de horario */}
      {showBlockModal && slotStart && slotEnd && (
        <TimeBlockModal
          start={slotStart}
          end={slotEnd}
          onClose={() => { setShowBlockModal(false); setSlotStart(null); setSlotEnd(null); }}
          onSaved={refreshCalendar}
        />
      )}
    </>
  );
}
