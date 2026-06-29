export type SettingsForm = {
  // Datos
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  phone: string;
  website: string;
  timezone: string;
  currency: string;
  // Redes
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  // Políticas
  bookingAdvanceDays: number;
  minCancelHours: number;
  bufferMinutes: number;
  depositPercent: number;
  requirePayment: boolean;
  autoConfirm: boolean;
  allowClientCancel: boolean;
  allowClientReschedule: boolean;
  // Notificaciones
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  reminder24h: boolean;
  reminder1h: boolean;
  reviewRequestEnabled: boolean;
};

export type SettingsField = keyof SettingsForm;

export const EMPTY_SETTINGS: SettingsForm = {
  name: "", slug: "", description: "", logoUrl: null, phone: "", website: "",
  timezone: "America/Santiago", currency: "CLP",
  instagram: "", facebook: "", tiktok: "", whatsapp: "",
  bookingAdvanceDays: 60, minCancelHours: 24, bufferMinutes: 0, depositPercent: 0,
  requirePayment: false, autoConfirm: true, allowClientCancel: true, allowClientReschedule: true,
  emailEnabled: true, smsEnabled: false, whatsappEnabled: false,
  reminder24h: true, reminder1h: false, reviewRequestEnabled: true,
};
