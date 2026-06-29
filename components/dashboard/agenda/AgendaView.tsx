"use client";

import { useState, useCallback } from "react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays, Users, Clock, Code, LayoutGrid, List,
  AlignJustify, Minus, Plus, ChevronLeft, ChevronRight,
  RotateCcw, Maximize2, Printer, Clock3, CalendarPlus,
} from "lucide-react";
import { ProSchedulerGrid } from "@/components/dashboard/agenda/scheduler/ProSchedulerGrid";
import { MiniCalendar }     from "@/components/dashboard/agenda/sidebar/MiniCalendar";
import { AppointmentModal } from "@/components/dashboard/agenda/AppointmentModal";
import { TimeBlockModal }   from "@/components/dashboard/agenda/TimeBlockModal";
import { InlinePOSModal }   from "@/components/dashboard/agenda/modals/InlinePOSModal";
import { ClassesPanel }     from "@/components/dashboard/agenda/ClassesPanel";
import { WaitlistPanel }    from "@/components/dashboard/agenda/WaitlistPanel";
import { WidgetPanel }      from "@/components/dashboard/agenda/WidgetPanel";
import type { AppointmentListItem } from "@/lib/services/appointment.service";
import type { AgendaViewMode, ZoomLevel, AgendaFilters, TimeBlockItem, AgendaStaff } from "@/types/agenda";

type Props = {
  appointments:  AppointmentListItem[];
  timeBlocks:    { id: string; title: string; startTime: Date | string; endTime: Date | string; color: string; staffId?: string | null; reason?: string | null }[];
  businessSlug:  string;
  staff?:        AgendaStaff[];
};

const VIEWS: { key: AgendaViewMode; label: string; icon: React.ElementType }[] = [
  { key: "scheduler", label: "Agenda",    icon: LayoutGrid    },
  { key: "list",      label: "Lista",     icon: List          },
  { key: "comfort",   label: "CÃ³moda",    icon: CalendarDays  },
  { key: "compact",   label: "Compacta",  icon: AlignJustify  },
];

const ZOOM_LEVELS: ZoomLevel[] = [48, 64, 80, 96, 112];
const SECONDARY_TABS = [
  { key: "classes",  label: "Clases",           icon: Users  },
  { key: "waitlist", label: "Lista de espera",   icon: Clock  },
  { key: "widget",   label: "BotÃ³n de reserva",  icon: Code   },
] as const;

const DEFAULT_FILTERS: AgendaFilters = { staffIds: [], statuses: [], searchQuery: "" };

export function AgendaView({ appointments, timeBlocks, businessSlug, staff = [] }: Props) {
  const [view,           setView]           = useState<AgendaViewMode>("scheduler");
  const [secondaryTab,   setSecondaryTab]   = useState<string | null>(null);
  const [selectedDate,   setSelectedDate]   = useState(new Date());
  const [zoom,           setZoom]           = useState<ZoomLevel>(80);
  const [filters,        setFilters]        = useState<AgendaFilters>(DEFAULT_FILTERS);
  const [selectedAppt,   setSelectedAppt]   = useState<AppointmentListItem | null>(null);
  const [posAppt,        setPosAppt]        = useState<AppointmentListItem | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockSlot,      setBlockSlot]      = useState<{ start: Date; end: Date } | null>(null);
  const [localAppts,     setLocalAppts]     = useState(appointments ?? []);
  const [localBlocks,    setLocalBlocks]    = useState(timeBlocks   ?? []);
  const [isFullscreen,   setIsFullscreen]   = useState(false);

  const normalizedBlocks: TimeBlockItem[] = (localBlocks ?? []).map((b) => ({
    ...b,
    startTime: new Date(b.startTime),
    endTime:   new Date(b.endTime),
    staffId:   b.staffId ?? null,
    reason:    b.reason  ?? null,
  }));

  async function refreshCalendar() {
    try {
      const [aRes, bRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/time-blocks"),
      ]);
      if (aRes.ok) {
        const data = await aRes.json().catch(() => null);
        if (Array.isArray(data)) setLocalAppts(data);
      }
      if (bRes.ok) {
        const data = await bRes.json().catch(() => null);
        if (Array.isArray(data)) setLocalBlocks(data);
      }
    } catch { /* red error — mantiene estado anterior */ }
  }

  const handleApptMove = useCallback(async (id: string, newStart: Date, newEnd: Date, newStaffId: string) => {
    const res = await fetch("/api/appointments/move", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, startTime: newStart.toISOString(), endTime: newEnd.toISOString(), staffId: newStaffId }),
    });
    if (res.ok) {
      setLocalAppts((prev) => prev.map((a) =>
        a.id === id ? { ...a, startTime: newStart, endTime: newEnd, staffId: newStaffId } : a
      ));
    }
  }, []);

  const zoomIn  = () => setZoom((z) => ZOOM_LEVELS[Math.min(ZOOM_LEVELS.indexOf(z) + 1, ZOOM_LEVELS.length - 1)]);
  const zoomOut = () => setZoom((z) => ZOOM_LEVELS[Math.max(ZOOM_LEVELS.indexOf(z) - 1, 0)]);

  const dayAppts = (localAppts ?? []).filter((a) => {
    const d = new Date(a.startTime);
    return d.getFullYear() === selectedDate.getFullYear() &&
           d.getMonth()    === selectedDate.getMonth()    &&
           d.getDate()     === selectedDate.getDate();
  });

  const dateLabel = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const staffCount = staff.length;
  const dayCount   = dayAppts.length;

  const activeFiltersCount = filters.staffIds.length + filters.statuses.length + (filters.searchQuery ? 1 : 0);

  if (secondaryTab) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setSecondaryTab(null)}
            className="flex items-center gap-1.5 text-xs font-body text-slate-500 hover:text-brand-navy transition-colors">
            <ChevronLeft size={14} /> Volver a la agenda
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6">
          {secondaryTab === "classes"  && <ClassesPanel />}
          {secondaryTab === "waitlist" && <WaitlistPanel />}
          {secondaryTab === "widget"   && <WidgetPanel slug={businessSlug} />}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${isFullscreen ? "fixed inset-0 z-50 bg-white p-4 overflow-hidden" : "h-[calc(100vh-140px)]"}`}>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col gap-3 w-[220px] flex-shrink-0 overflow-y-auto scrollbar-none">
        {/* Filtros rÃ¡pidos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-slate-400">Filtros</p>
            {activeFiltersCount > 0 && (
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-[10px] font-body text-brand-teal hover:text-brand-navy flex items-center gap-0.5 transition-colors">
                <RotateCcw size={10} /> Reset
              </button>
            )}
          </div>
          <p className="text-slate-400 text-[10px] font-body mb-2">Segmenta la oper...</p>

          {staff.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-sans font-semibold text-slate-600 mb-1.5">Profesional</p>
              <div className="space-y-1">
                <button onClick={() => setFilters((f) => ({ ...f, staffIds: [] }))}
                  className={`w-full text-left text-xs font-body px-2 py-1 rounded-lg transition-colors ${filters.staffIds.length === 0 ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                  Todos
                </button>
                {staff.map((s) => (
                  <button key={s.id}
                    onClick={() => setFilters((f) => ({
                      ...f,
                      staffIds: f.staffIds.includes(s.id) ? f.staffIds.filter((id) => id !== s.id) : [...f.staffIds, s.id],
                    }))}
                    className={`w-full text-left text-xs font-body px-2 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${filters.staffIds.includes(s.id) ? "bg-slate-100 text-brand-navy font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                    {s.color && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />}
                    <span className="truncate">{s.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mini calendario */}
        <MiniCalendar
          selectedDate={selectedDate}
          onChange={setSelectedDate}
          appointmentDates={(localAppts ?? []).map((a) => new Date(a.startTime))}
        />

        {/* Otras secciones */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-3 space-y-1">
          {SECONDARY_TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSecondaryTab(key)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-body text-slate-600 hover:bg-slate-50 hover:text-brand-navy transition-colors">
              <Icon size={13} className="text-slate-400" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel principal */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-brand px-4 py-2.5 flex items-center gap-2 flex-wrap">

          {/* TÃ­tulo del dÃ­a */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-brand-teal">Agenda Operativa</p>
            <p className="font-sans font-bold text-brand-navy text-base leading-tight capitalize truncate">{dateLabel}</p>
            <p className="text-slate-400 text-[11px] font-body">{dayCount} cita{dayCount !== 1 ? "s" : ""} Â· {staffCount} profesional{staffCount !== 1 ? "es" : ""} visible{staffCount !== 1 ? "s" : ""}</p>
          </div>

          {/* Vistas */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {VIEWS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setView(key)}
                className={["flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all",
                  view === key ? "bg-brand-navy text-white shadow-sm" : "text-slate-500 hover:text-brand-navy",
                ].join(" ")}>
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* NavegaciÃ³n */}
          <div className="flex items-center gap-1">
            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-brand-navy transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setSelectedDate(new Date())}
              className="px-2.5 py-1 rounded-lg text-xs font-sans font-semibold text-slate-500 hover:bg-slate-100 hover:text-brand-navy transition-colors">
              Hoy
            </button>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-brand-navy transition-colors">
              <ChevronRight size={14} />
            </button>
            <button onClick={refreshCalendar}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <RotateCcw size={13} />
            </button>
            <button onClick={() => setIsFullscreen((f) => !f)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <Maximize2 size={13} />
            </button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              onClick={() => window.print()}>
              <Printer size={13} />
            </button>
          </div>

          {/* Zoom (solo en scheduler) */}
          {view === "scheduler" && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button onClick={zoomOut} disabled={zoom === ZOOM_LEVELS[0]}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                <Minus size={11} />
              </button>
              <span className="text-[10px] font-body text-slate-400 w-6 text-center">{Math.round((zoom / 80) * 100)}%</span>
              <button onClick={zoomIn} disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                <Plus size={11} />
              </button>
            </div>
          )}

          {/* Acciones principales */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
            <button onClick={() => { setBlockSlot({ start: selectedDate, end: new Date(selectedDate.getTime() + 3600000) }); setShowBlockModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-sans font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Clock3 size={13} />
              <span className="hidden md:inline">Bloquear horario</span>
            </button>
            <button onClick={() => { /* TODO: abrir CreateAppointmentModal */ }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #6FA89E, #5a9990)" }}>
              <CalendarPlus size={13} />
              <span>Nueva reserva</span>
            </button>
          </div>
        </div>

        {/* Vista principal */}
        <div className="flex-1 min-h-0">
          {view === "scheduler" && (
            <ProSchedulerGrid
              appointments={dayAppts}
              timeBlocks={normalizedBlocks}
              staff={staff}
              selectedDate={selectedDate}
              hourHeight={zoom}
              filters={filters}
              onApptClick={(appt) => setSelectedAppt(appt)}
              onSlotClick={() => { /* TODO: CreateAppointmentModal */ }}
              onApptMove={handleApptMove}
            />
          )}

          {view === "list" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-brand overflow-hidden h-full overflow-y-auto">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-sans font-semibold text-slate-600">
                  {dayCount} citas Â· {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </p>
              </div>
              {dayAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <CalendarDays size={32} className="mb-3 opacity-30" />
                  <p className="text-sm font-body">Sin citas para este dÃ­a</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {[...dayAppts].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((appt) => (
                    <button key={appt.id} onClick={() => setSelectedAppt(appt)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors text-left group">
                      <div className="text-right w-16 flex-shrink-0">
                        <p className="text-xs font-sans font-bold text-brand-navy">{format(new Date(appt.startTime), "HH:mm")}</p>
                        <p className="text-[10px] font-body text-slate-400">{format(new Date(appt.endTime), "HH:mm")}</p>
                      </div>
                      <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: "#0D1B2A" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans font-semibold text-brand-navy truncate">{appt.clientName}</p>
                        <p className="text-xs font-body text-slate-400 truncate">{appt.services?.[0]?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {appt.totalPrice != null && <p className="text-xs font-sans font-bold text-brand-teal">${Number(appt.totalPrice).toLocaleString("es-CL")}</p>}
                        <span className="text-[9px] font-sans px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{appt.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {(view === "comfort" || view === "compact") && (
            <div className={`bg-white rounded-2xl border border-slate-100 shadow-brand h-full overflow-y-auto p-4 ${view === "comfort" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 content-start" : "space-y-1"}`}>
              {dayAppts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
                  <CalendarDays size={32} className="mb-3 opacity-30" />
                  <p className="text-sm font-body">Sin citas para este dÃ­a</p>
                </div>
              ) : [...dayAppts].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((appt) => (
                <button key={appt.id} onClick={() => setSelectedAppt(appt)}
                  className={`text-left border border-slate-100 rounded-xl hover:shadow-brand transition-all ${view === "comfort" ? "p-4" : "px-4 py-2 flex items-center gap-3"}`}>
                  {view === "comfort" ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-sans font-bold text-brand-navy">{format(new Date(appt.startTime), "HH:mm")} â€“ {format(new Date(appt.endTime), "HH:mm")}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-sans">{appt.status}</span>
                      </div>
                      <p className="font-sans font-semibold text-brand-navy text-sm">{appt.clientName}</p>
                      <p className="text-xs font-body text-slate-400 mt-0.5">{appt.services?.[0]?.name}</p>
                      {appt.totalPrice != null && <p className="text-xs font-sans font-bold text-brand-teal mt-2">${Number(appt.totalPrice).toLocaleString("es-CL")}</p>}
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-sans font-bold text-slate-400 w-10 flex-shrink-0">{format(new Date(appt.startTime), "HH:mm")}</span>
                      <span className="flex-1 text-xs font-body text-brand-navy truncate">{appt.clientName}</span>
                      <span className="text-[10px] font-body text-slate-400 truncate hidden sm:block">{appt.services?.[0]?.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-sans flex-shrink-0">{appt.status}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {selectedAppt && (
        <AppointmentModal
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onUpdated={refreshCalendar}
          onCharge={(appt) => { setSelectedAppt(null); setPosAppt(appt); }}
        />
      )}

      {posAppt && (
        <InlinePOSModal
          appointment={posAppt}
          isOpen={!!posAppt}
          onClose={() => setPosAppt(null)}
          onSuccess={() => { setPosAppt(null); refreshCalendar(); }}
        />
      )}

      {showBlockModal && blockSlot && (
        <TimeBlockModal
          start={blockSlot.start}
          end={blockSlot.end}
          onClose={() => { setShowBlockModal(false); setBlockSlot(null); }}
          onSaved={refreshCalendar}
        />
      )}
    </div>
  );
}

