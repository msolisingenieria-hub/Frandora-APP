"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import type { AppointmentListItem } from "@/lib/services/appointment.service";
import type { AppointmentWithLayout } from "@/types/agenda";
import { STATUS_COLORS } from "@/types/agenda";
import { apptTop, apptHeight } from "./schedulerUtils";

interface Props {
  appointment: AppointmentWithLayout;
  hourHeight:   number;
  gridStartHour: number;
  onClick:      (appt: AppointmentListItem) => void;
  onDragStart:  (e: React.DragEvent, appt: AppointmentListItem) => void;
}

export function AppointmentCard({ appointment: appt, hourHeight, gridStartHour, onClick, onDragStart }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const top    = apptTop(appt.startTime, gridStartHour, hourHeight);
  const height = apptHeight(appt.startTime, appt.endTime, hourHeight);
  const leftPct  = (appt._colIdx / appt._totalCols) * 100;
  const widthPct = (1 / appt._totalCols) * 100;

  const bg    = STATUS_COLORS[appt.status] ?? "#0D1B2A";
  const isLight = appt.status === "CANCELED" || appt.status === "COMPLETED";
  const isCanceled = appt.status === "CANCELED";

  const clientName  = appt.clientName ?? "Cliente";
  const serviceName = appt.services?.[0]?.name ?? "";
  const timeRange   = `${format(new Date(appt.startTime), "HH:mm")}–${format(new Date(appt.endTime), "HH:mm")}`;
  const price       = appt.totalPrice != null ? `$${Number(appt.totalPrice).toLocaleString("es-CL")}` : "";

  function handleMouseEnter() {
    tooltipTimer.current = setTimeout(() => setShowTooltip(true), 350);
  }
  function handleMouseLeave() {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setShowTooltip(false);
  }

  return (
    <div
      className="absolute select-none transition-all duration-[120ms] ease-out group hover:z-30 hover:scale-[1.02]"
      style={{
        top:    `${top}px`,
        height: `${height}px`,
        left:   `${leftPct}%`,
        width:  `calc(${widthPct}% - 3px)`,
        backgroundColor: bg,
        borderRadius: "6px",
        padding: "3px 6px",
        cursor: "grab",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }}
      draggable
      onDragStart={(e) => { onDragStart(e, appt); }}
      onClick={(e) => { e.stopPropagation(); onClick(appt); }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dot de estado */}
      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/60" />

      {/* Contenido */}
      <p className={`text-[11px] font-sans font-semibold leading-tight truncate ${isLight ? "text-slate-600" : "text-white"} ${isCanceled ? "line-through opacity-60" : ""}`}>
        {clientName}
      </p>
      {height > 38 && serviceName && (
        <p className={`text-[10px] font-body truncate mt-0.5 ${isLight ? "text-slate-400" : "text-white/70"}`}>
          {serviceName}
        </p>
      )}
      {height > 55 && (
        <p className={`text-[10px] font-body mt-0.5 ${isLight ? "text-slate-400" : "text-white/55"}`}>
          {timeRange}
        </p>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-full top-0 ml-2 z-50 bg-brand-navy text-white rounded-xl shadow-brand-lg p-3 w-52 pointer-events-none"
          style={{ animation: "fadeIn 0.1s ease-out" }}>
          <p className="font-sans font-semibold text-xs">{clientName}</p>
          {serviceName && <p className="text-white/70 text-[11px] font-body mt-0.5">{serviceName}</p>}
          <p className="text-white/60 text-[11px] font-body mt-1">{timeRange}</p>
          {price && <p className="text-brand-teal text-[11px] font-sans font-semibold mt-1">{price}</p>}
          <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-sans font-semibold`}
            style={{ backgroundColor: bg + "33", color: isLight ? "#64748b" : bg }}>
            {appt.status}
          </span>
        </div>
      )}
    </div>
  );
}
