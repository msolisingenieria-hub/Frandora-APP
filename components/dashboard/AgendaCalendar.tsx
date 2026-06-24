"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import type { AppointmentListItem } from "@/lib/services/appointment.service";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { es },
});

type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AppointmentListItem;
};

type Props = {
  appointments: AppointmentListItem[];
  onSelectEvent?: (appt: AppointmentListItem) => void;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:     "#6FA89E",
  CONFIRMED:   "#0D1B2A",
  IN_PROGRESS: "#162d43",
  COMPLETED:   "#4a7c75",
  CANCELLED:   "#94a3b8",
  NO_SHOW:     "#e11d48",
};

const MESSAGES = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Cita",
  noEventsInRange: "No hay citas en este período",
  showMore: (total: number) => `+${total} más`,
};

export function AgendaCalendar({ appointments, onSelectEvent }: Props) {
  const [view, setView] = useState<string>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const events: CalEvent[] = useMemo(() =>
    appointments.map((a) => ({
      id: a.id,
      title: [
        a.clientName ?? "Sin nombre",
        a.services[0]?.name ?? "",
      ].filter(Boolean).join(" · "),
      start: new Date(a.startTime),
      end: new Date(a.endTime),
      resource: a,
    })),
  [appointments]);

  const eventStyleGetter = (event: CalEvent) => {
    const status = event.resource.status;
    const bg = event.resource.staffColor ?? STATUS_COLORS[status] ?? "#0D1B2A";
    return {
      style: {
        backgroundColor: bg,
        borderRadius: "8px",
        border: "none",
        color: "#fff",
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 6px",
      },
    };
  };

  return (
    <div className="h-[calc(100vh-180px)] min-h-[500px]">
      <style>{`
        .rbc-calendar { font-family: 'Inter', sans-serif; }
        .rbc-header { background: #f8fafc; font-size: 11px; font-weight: 600; color: #0D1B2A; padding: 8px 4px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #e2e8f0; }
        .rbc-today { background-color: rgba(111,168,158,0.06) !important; }
        .rbc-toolbar { gap: 8px; flex-wrap: wrap; }
        .rbc-toolbar button { border-radius: 8px !important; border: 1.5px solid #e2e8f0 !important; color: #0D1B2A; font-size: 12px; font-weight: 600; padding: 5px 12px; }
        .rbc-toolbar button:hover { background: #0D1B2A !important; color: #fff !important; border-color: #0D1B2A !important; }
        .rbc-toolbar button.rbc-active { background: #0D1B2A !important; color: #fff !important; border-color: #0D1B2A !important; }
        .rbc-toolbar-label { font-family: 'Poppins', sans-serif; font-weight: 600; color: #0D1B2A; }
        .rbc-time-slot { font-size: 10px; color: #94a3b8; }
        .rbc-event { outline: none; }
        .rbc-event:focus { outline: none; }
        .rbc-slot-selection { background: rgba(111,168,158,0.15); }
        .rbc-current-time-indicator { background: #6FA89E; height: 2px; }
        .rbc-off-range-bg { background: #f8fafc; }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        view={view as any}
        date={date}
        onView={(v) => setView(v)}
        onNavigate={(d) => setDate(d)}
        onSelectEvent={(event: CalEvent) => onSelectEvent?.(event.resource)}
        eventPropGetter={eventStyleGetter}
        messages={MESSAGES}
        culture="es"
        step={30}
        timeslots={2}
        min={new Date(0, 0, 0, 7, 0)}
        max={new Date(0, 0, 0, 22, 0)}
      />
    </div>
  );
}
