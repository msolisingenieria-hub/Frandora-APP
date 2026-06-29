"use client";

import { useRef, useEffect, useCallback } from "react";
import { getHours, getMinutes } from "date-fns";
import type { AppointmentListItem } from "@/lib/services/appointment.service";
import type { AgendaStaff, TimeBlockItem, AgendaFilters } from "@/types/agenda";
import { resolveOverlaps, isStaffWorking, yToDate, minutesToTop } from "./schedulerUtils";
import { AppointmentCard } from "./AppointmentCard";
import { TimeColumn } from "./TimeColumn";
import { StaffColumnHeader } from "./StaffColumnHeader";

const START_HOUR = 7;
const END_HOUR   = 22;
const MIN_COL_W  = 172;

interface Props {
  appointments:  AppointmentListItem[];
  timeBlocks:    TimeBlockItem[];
  staff:         AgendaStaff[];
  selectedDate:  Date;
  hourHeight:    number;
  filters:       AgendaFilters;
  onApptClick:   (appt: AppointmentListItem) => void;
  onSlotClick:   (start: Date, staffId: string) => void;
  onApptMove:    (apptId: string, newStart: Date, newEnd: Date, newStaffId: string) => void;
}

export function ProSchedulerGrid({
  appointments, timeBlocks, staff, selectedDate,
  hourHeight, filters, onApptClick, onSlotClick, onApptMove,
}: Props) {
  const timeScrollRef = useRef<HTMLDivElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing     = useRef(false);
  const dragAppt      = useRef<AppointmentListItem | null>(null);

  // Sincronizar scroll vertical
  const syncScroll = useCallback((src: HTMLDivElement, tgt: HTMLDivElement) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    tgt.scrollTop = src.scrollTop;
    requestAnimationFrame(() => { isSyncing.current = false; });
  }, []);

  useEffect(() => {
    const ts = timeScrollRef.current;
    const gs = gridScrollRef.current;
    if (!ts || !gs) return;
    const onTs = () => syncScroll(ts, gs);
    const onGs = () => syncScroll(gs, ts);
    ts.addEventListener("scroll", onTs, { passive: true });
    gs.addEventListener("scroll", onGs, { passive: true });
    // Scroll inicial a la hora actual (o 8am)
    const now = new Date();
    const targetHour = Math.max(now.getHours() - 1, START_HOUR);
    gs.scrollTop = (targetHour - START_HOUR) * hourHeight;
    return () => { ts.removeEventListener("scroll", onTs); gs.removeEventListener("scroll", onGs); };
  }, [syncScroll, hourHeight]);

  // Guards defensivos
  const safeStaff   = staff        ?? [];
  const safeAppts   = appointments ?? [];
  const safeBlocks  = timeBlocks   ?? [];
  const staffIds    = filters?.staffIds  ?? [];
  const statuses    = filters?.statuses  ?? [];
  const searchQuery = filters?.searchQuery ?? "";

  const filteredStaff = safeStaff.filter((s) =>
    staffIds.length === 0 || staffIds.includes(s.id)
  );

  const filteredAppts = safeAppts.filter((a) => {
    if (statuses.length > 0 && !statuses.includes(a.status)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.clientName?.toLowerCase().includes(q) &&
          !a.services?.[0]?.name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalHeight = (END_HOUR - START_HOUR) * hourHeight;
  const gridHeight  = Math.max(totalHeight, 400);

  function getStaffAppts(staffId: string) {
    return resolveOverlaps(filteredAppts.filter((a) => a.staffId === staffId));
  }

  function getStaffBlocks(staffId: string) {
    return safeBlocks.filter((b) => !b.staffId || b.staffId === staffId);
  }

  function handleDragStart(e: React.DragEvent, appt: AppointmentListItem) {
    dragAppt.current = appt;
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).style.opacity = "0.5";
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    dragAppt.current = null;
  }

  function handleDrop(e: React.DragEvent, staffId: string) {
    e.preventDefault();
    const appt = dragAppt.current;
    if (!appt) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y    = e.clientY - rect.top + (gridScrollRef.current?.scrollTop ?? 0);
    const newStart = yToDate(y, hourHeight, START_HOUR, selectedDate);
    const dur      = new Date(appt.endTime).getTime() - new Date(appt.startTime).getTime();
    const newEnd   = new Date(newStart.getTime() + dur);
    onApptMove(appt.id, newStart, newEnd, staffId);
  }

  function handleColClick(e: React.MouseEvent, staffId: string) {
    if ((e.target as HTMLElement).closest("[data-appt]")) return;
    const rect  = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y     = e.clientY - rect.top + (gridScrollRef.current?.scrollTop ?? 0);
    const start = yToDate(y, hourHeight, START_HOUR, selectedDate);
    onSlotClick(start, staffId);
  }

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  // Línea de hora actual
  const now        = new Date();
  const nowMinutes = getHours(now) * 60 + getMinutes(now);
  const showLine   = nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;
  const lineTop    = minutesToTop(nowMinutes, START_HOUR, hourHeight);

  return (
    <div className="flex h-full overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-brand">

      {/* Columna de horas */}
      <div className="w-14 flex-shrink-0 border-r border-slate-100 flex flex-col min-h-0">
        <div className="h-14 border-b border-slate-100 flex-shrink-0" />
        <div ref={timeScrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none">
          <TimeColumn hourHeight={hourHeight} startHour={START_HOUR} endHour={END_HOUR} />
        </div>
      </div>

      {/* Grid de profesionales */}
      <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden flex flex-col min-h-0">

        {/* Headers fijos */}
        <div className="flex border-b border-slate-100 flex-shrink-0 bg-white/95 backdrop-blur-sm z-20">
          {filteredStaff.map((s) => (
            <div key={s.id} className="flex-shrink-0 border-r border-slate-100" style={{ minWidth: MIN_COL_W }}>
              <StaffColumnHeader
                staff={s}
                isWorking={isStaffWorking(s, selectedDate)}
                appointmentCount={filteredAppts.filter((a) => a.staffId === s.id).length}
              />
            </div>
          ))}
          {filteredStaff.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-body h-14">
              No hay profesionales para mostrar
            </div>
          )}
        </div>

        {/* Cuerpo scrolleable */}
        <div ref={gridScrollRef} className="flex flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {filteredStaff.map((s) => {
            const working = isStaffWorking(s, selectedDate);
            return (
              <div
                key={s.id}
                className="flex-shrink-0 relative border-r border-slate-100/70 cursor-default"
                style={{ minWidth: MIN_COL_W, height: gridHeight }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, s.id)}
                onClick={(e) => handleColClick(e, s.id)}
              >
                {/* Líneas de hora */}
                {hours.map((h) => (
                  <div key={h}>
                    <div className="absolute w-full border-t border-slate-100" style={{ top: (h - START_HOUR) * hourHeight }} />
                    <div className="absolute w-full border-t border-slate-50" style={{ top: (h - START_HOUR) * hourHeight + hourHeight / 2 }} />
                  </div>
                ))}

                {/* Overlay "no atiende" */}
                {!working && (
                  <div className="absolute inset-0 bg-slate-50/60 z-5 pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <span className="text-slate-400 text-xs font-body rotate-[-30deg] select-none tracking-widest uppercase">No atiende</span>
                    </div>
                  </div>
                )}

                {/* Time blocks */}
                {getStaffBlocks(s.id).map((block) => {
                  const bt  = minutesToTop(getHours(block.startTime) * 60 + getMinutes(block.startTime), START_HOUR, hourHeight);
                  const bh  = Math.max(((block.endTime.getTime() - block.startTime.getTime()) / 3600000) * hourHeight, 20);
                  return (
                    <div key={block.id} className="absolute left-1 right-1 rounded-md opacity-70 flex items-start px-2 pt-1 z-5"
                      style={{ top: bt, height: bh, backgroundColor: block.color + "33", borderLeft: `3px solid ${block.color}`, borderStyle: "dashed" }}>
                      <span className="text-[10px] font-body text-slate-500 truncate">{block.title}</span>
                    </div>
                  );
                })}

                {/* Citas */}
                {getStaffAppts(s.id).map((appt) => (
                  <div key={appt.id} data-appt="1" onDragEnd={handleDragEnd}>
                    <AppointmentCard
                      appointment={appt}
                      hourHeight={hourHeight}
                      gridStartHour={START_HOUR}
                      onClick={onApptClick}
                      onDragStart={handleDragStart}
                    />
                  </div>
                ))}

                {/* Línea de tiempo actual */}
                {showLine && (
                  <div className="absolute left-0 right-0 pointer-events-none z-10"
                    style={{ top: lineTop }}>
                    <div className="h-px bg-rose-400 w-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
