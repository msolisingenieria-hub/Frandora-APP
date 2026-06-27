"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import withDragAndDrop, { type EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import type { AppointmentListItem } from "@/lib/services/appointment.service";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { es },
});

const DnDCalendar = withDragAndDrop(Calendar);

type TimeBlock = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  isBlock: true;
};

type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AppointmentListItem;
  resourceId?: string;
  isBlock?: false;
};

type AnyEvent = CalEvent | TimeBlock;
type StaffResource = { resourceId: string; resourceTitle: string };

type Props = {
  appointments: AppointmentListItem[];
  timeBlocks?:  Array<{ id: string; title: string; startTime: Date | string; endTime: Date | string; color: string }>;
  onSelectEvent?: (appt: AppointmentListItem) => void;
  onSelectSlot?:  (start: Date, end: Date) => void;
  onMoveEvent?:   (id: string, start: Date, end: Date) => void;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:     "#6FA89E",
  CONFIRMED:   "#0D1B2A",
  IN_PROGRESS: "#162d43",
  COMPLETED:   "#4a7c75",
  CANCELED:    "#94a3b8",
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
  agenda: "Lista",
  date: "Fecha",
  time: "Hora",
  event: "Cita",
  noEventsInRange: "No hay citas en este período",
  showMore: (total: number) => `+${total} más`,
};

export function AgendaCalendar({ appointments, timeBlocks = [], onSelectEvent, onSelectSlot, onMoveEvent }: Props) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const resources: StaffResource[] = useMemo(() => {
    const seen = new Set<string>();
    const list: StaffResource[] = [];
    for (const a of appointments) {
      const rid = a.staffId ?? "sin-profesional";
      if (!seen.has(rid)) {
        seen.add(rid);
        list.push({ resourceId: rid, resourceTitle: a.staffName ?? "Sin profesional" });
      }
    }
    return list;
  }, [appointments]);

  const events: AnyEvent[] = useMemo(() => {
    const apptEvents: CalEvent[] = appointments.map((a) => ({
      id:         a.id,
      title:      [a.clientName ?? "Sin nombre", a.services[0]?.name ?? ""].filter(Boolean).join(" · "),
      start:      new Date(a.startTime),
      end:        new Date(a.endTime),
      resource:   a,
      resourceId: a.staffId ?? "sin-profesional",
    }));
    const blockEvents: TimeBlock[] = timeBlocks.map((b) => ({
      id:      b.id,
      title:   b.title,
      start:   new Date(b.startTime),
      end:     new Date(b.endTime),
      color:   b.color,
      isBlock: true as const,
    }));
    return [...apptEvents, ...blockEvents];
  }, [appointments, timeBlocks]);

  const eventStyleGetter = (event: object) => {
    const ev = event as AnyEvent;
    if ("isBlock" in ev && ev.isBlock) {
      const event = ev as TimeBlock;
      return {
        style: {
          backgroundColor: event.color,
          opacity: 0.55,
          borderRadius: "6px",
          border: "2px dashed rgba(255,255,255,0.4)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 500,
          padding: "2px 6px",
          cursor: "default",
        },
      };
    }
    const e  = ev as CalEvent;
    const bg = e.resource.staffColor ?? STATUS_COLORS[e.resource.status] ?? "#0D1B2A";
    return {
      style: {
        backgroundColor: bg,
        borderRadius: "8px",
        border: "none",
        color: "#fff",
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 6px",
        cursor: "grab",
      },
    };
  };

  const handleSelectEvent = useCallback((event: object) => {
    const e = event as AnyEvent;
    if ("isBlock" in e && e.isBlock) return;
    onSelectEvent?.((e as CalEvent).resource);
  }, [onSelectEvent]);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    onSelectSlot?.(start, end);
  }, [onSelectSlot]);

  const handleEventDrop = useCallback(({ event, start, end }: EventInteractionArgs<object>) => {
    const e = event as AnyEvent;
    if ("isBlock" in e && e.isBlock) return;
    onMoveEvent?.((e as CalEvent).id, new Date(start as Date), new Date(end as Date));
  }, [onMoveEvent]);

  const handleEventResize = useCallback(({ event, start, end }: EventInteractionArgs<object>) => {
    const e = event as AnyEvent;
    if ("isBlock" in e && e.isBlock) return;
    onMoveEvent?.((e as CalEvent).id, new Date(start as Date), new Date(end as Date));
  }, [onMoveEvent]);

  const isResourceView = view === Views.DAY;

  return (
    <div className="h-[calc(100vh-220px)] min-h-[500px]">
      <style>{`
        .rbc-calendar { font-family: 'Inter', sans-serif; }
        .rbc-header { background:#f8fafc; font-size:11px; font-weight:600; color:#0D1B2A; padding:8px 4px; text-transform:uppercase; letter-spacing:.08em; border-bottom:1px solid #e2e8f0; }
        .rbc-today { background-color:rgba(111,168,158,.06) !important; }
        .rbc-toolbar { gap:8px; flex-wrap:wrap; margin-bottom:12px; }
        .rbc-toolbar button { border-radius:8px !important; border:1.5px solid #e2e8f0 !important; color:#0D1B2A; font-size:12px; font-weight:600; padding:5px 12px; }
        .rbc-toolbar button:hover { background:#0D1B2A !important; color:#fff !important; border-color:#0D1B2A !important; }
        .rbc-toolbar button.rbc-active { background:#0D1B2A !important; color:#fff !important; border-color:#0D1B2A !important; }
        .rbc-toolbar-label { font-family:'Poppins',sans-serif; font-weight:600; color:#0D1B2A; }
        .rbc-time-slot { font-size:10px; color:#94a3b8; }
        .rbc-event { outline:none; }
        .rbc-event:focus { outline:none; }
        .rbc-event.rbc-selected { outline:2px solid #6FA89E !important; outline-offset:2px; }
        .rbc-slot-selection { background:rgba(111,168,158,.15); }
        .rbc-current-time-indicator { background:#6FA89E; height:2px; }
        .rbc-off-range-bg { background:#f8fafc; }
        .rbc-resource-header { font-size:11px; font-weight:700; color:#0D1B2A; padding:6px 4px; }
        .rbc-addons-dnd-resize-ns-anchor { height:6px !important; }
      `}</style>
      <DnDCalendar
        localizer={localizer}
        events={events}
        view={view}
        date={date}
        onView={(v: View) => setView(v)}
        onNavigate={(d: Date) => setDate(d)}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventStyleGetter}
        messages={MESSAGES}
        culture="es"
        step={15}
        timeslots={4}
        min={new Date(0, 0, 0, 7, 0)}
        max={new Date(0, 0, 0, 22, 0)}
        selectable
        resizable
        resources={isResourceView && resources.length > 1 ? resources : undefined}
        resourceIdAccessor={isResourceView ? (r: object) => (r as StaffResource).resourceId : undefined}
        resourceTitleAccessor={isResourceView ? (r: object) => (r as StaffResource).resourceTitle : undefined}
        popup
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      />
    </div>
  );
}
