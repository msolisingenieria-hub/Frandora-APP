import { getHours, getMinutes, getDay } from "date-fns";
import type { AppointmentListItem } from "@/lib/services/appointment.service";
import type { AgendaStaff, AppointmentWithLayout } from "@/types/agenda";

export function resolveOverlaps(appointments: AppointmentListItem[]): AppointmentWithLayout[] {
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  type Column = { end: Date };
  const columns: Column[] = [];
  const result: (AppointmentWithLayout & { _colIdx: number })[] = [];

  for (const appt of sorted) {
    const start = new Date(appt.startTime);
    const end   = new Date(appt.endTime);
    const col   = columns.findIndex((c) => c.end <= start);
    const colIdx = col === -1 ? columns.length : col;
    if (col === -1) columns.push({ end });
    else            columns[col] = { end };
    result.push({ ...appt, _colIdx: colIdx, _totalCols: 0 });
  }

  // Calculate totalCols per overlapping group
  const n = result.length;
  for (let i = 0; i < n; i++) {
    const start = new Date(result[i].startTime);
    const end   = new Date(result[i].endTime);
    let maxCol  = result[i]._colIdx;
    for (let j = 0; j < n; j++) {
      const s2 = new Date(result[j].startTime);
      const e2 = new Date(result[j].endTime);
      if (s2 < end && e2 > start) maxCol = Math.max(maxCol, result[j]._colIdx);
    }
    result[i]._totalCols = maxCol + 1;
  }

  return result;
}

export function isStaffWorking(staff: AgendaStaff, date: Date): boolean {
  const dow = getDay(date); // 0=Sun, 1=Mon, ...
  const schedule = staff.schedules?.find((s) => s.dayOfWeek === dow);
  return schedule?.isAvailable ?? false;
}

export function minutesToTop(minutes: number, startHour: number, hourHeight: number): number {
  return ((minutes - startHour * 60) / 60) * hourHeight;
}

export function yToDate(y: number, hourHeight: number, startHour: number, base: Date): Date {
  const totalMinutes = startHour * 60 + Math.round((y / hourHeight) * 60 / 15) * 15;
  const result = new Date(base);
  result.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return result;
}

export function apptTop(startTime: Date | string, startHour: number, hourHeight: number): number {
  const d = new Date(startTime);
  return minutesToTop(getHours(d) * 60 + getMinutes(d), startHour, hourHeight);
}

export function apptHeight(startTime: Date | string, endTime: Date | string, hourHeight: number): number {
  const start = new Date(startTime);
  const end   = new Date(endTime);
  const mins  = (end.getTime() - start.getTime()) / 60000;
  return Math.max((mins / 60) * hourHeight, 22);
}
