import type { AppointmentListItem } from "@/lib/services/appointment.service";

export type { AppointmentListItem };

export type AgendaViewMode = "scheduler" | "list" | "comfort" | "compact";
export type ZoomLevel = 48 | 64 | 80 | 96 | 112;

export interface AgendaFilters {
  staffIds:    string[];
  statuses:    string[];
  searchQuery: string;
}

export interface TimeBlockItem {
  id:        string;
  staffId:   string | null;
  startTime: Date;
  endTime:   Date;
  title:     string;
  color:     string;
  reason?:   string | null;
}

export interface StaffScheduleDay {
  dayOfWeek:   number;
  isAvailable: boolean;
  startTime:   string;
  endTime:     string;
}

export interface AgendaStaff {
  id:          string;
  name:        string;
  role?:       string | null;
  color?:      string | null;
  avatarUrl?:  string | null;
  schedules:   StaffScheduleDay[];
}

export interface AppointmentWithLayout extends AppointmentListItem {
  _colIdx:   number;
  _totalCols: number;
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING:     "#F59E0B",
  CONFIRMED:   "#0D1B2A",
  IN_PROGRESS: "#2563EB",
  COMPLETED:   "#64748B",
  CANCELED:    "#CBD5E1",
  NO_SHOW:     "#F87171",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING:     "Pendiente",
  CONFIRMED:   "Confirmada",
  IN_PROGRESS: "En proceso",
  COMPLETED:   "Completada",
  CANCELED:    "Cancelada",
  NO_SHOW:     "No asistió",
};
