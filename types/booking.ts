// ── Tipos del flujo de reserva pública ──

export type BookingStep = 1 | 2 | 3 | 4 | 5;
// 1=Servicio 2=Profesional 3=FechaHora 4=DatosCliente 5=Confirmación

export type PublicService = {
  id: string;
  name: string;
  description: string | null;
  duration: number;    // minutos
  price: number;
  color: string;
  categoryName: string | null;
};

export type PublicStaff = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  serviceIds: string[];
};

export type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  phone: string | null;
  currency: string;
  timezone: string;
  services: PublicService[];
  staff: PublicStaff[];
  schedule: DaySchedulePublic[];
};

export type DaySchedulePublic = {
  dayOfWeek: number; // 0=Dom, 6=Sáb
  openTime: string;  // "09:00"
  closeTime: string; // "18:00"
  isClosed: boolean;
};

export type TimeSlot = {
  time: string;      // ISO string
  label: string;     // "09:00"
  available: boolean;
};

export type BookingFormState = {
  step: BookingStep;
  serviceId: string | null;
  staffId: string | null;  // null = "cualquier profesional"
  date: Date | null;
  startTime: string | null; // ISO string
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
};

export type BookingResult = {
  bookingCode: string;
  appointmentId: string;
  startTime: string;
  endTime: string;
  staffName: string;
  serviceName: string;
  businessName: string;
};

export const INITIAL_BOOKING_STATE: BookingFormState = {
  step: 1,
  serviceId: null,
  staffId: null,
  date: null,
  startTime: null,
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  notes: "",
};

// Formatea precio según moneda
export function formatPrice(price: number, currency = "CLP"): string {
  if (currency === "CLP") {
    return `$${Math.round(price).toLocaleString("es-CL")}`;
  }
  return new Intl.NumberFormat("es-CL", { style: "currency", currency }).format(price);
}

// Formatea duración en minutos → "1h 30min"
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// Nombres de días en español
export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DAY_NAMES_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
