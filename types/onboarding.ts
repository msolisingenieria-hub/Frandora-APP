export type ServiceInput = {
  tempId: string;
  name: string;
  duration: number;
  price: number;
};

export type DaySchedule = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export type OnboardingData = {
  category: string;
  categoryLabel: string;
  categoryCustomLabel?: string; // para categoría "Otro"
  businessName: string;
  phone: string;
  address: string;
  city: string;
  description: string;
  services: ServiceInput[];
  schedule: Record<number, DaySchedule>;
  planTier: string;
  isAnnual: boolean;
};

import type { LucideIcon } from "lucide-react";

export type BusinessCategoryOption = {
  id: string;
  label: string;
  iconName: string;
};

export const BUSINESS_CATEGORIES: BusinessCategoryOption[] = [
  { id: "BARBERSHOP",       label: "Barbería",           iconName: "Scissors" },
  { id: "HAIR_SALON",       label: "Salón de Cabello",   iconName: "Wind" },
  { id: "BEAUTY_SALON",     label: "Salón de Belleza",   iconName: "Sparkles" },
  { id: "SPA",              label: "Spa",                iconName: "Waves" },
  { id: "NAIL_SALON",       label: "Uñas & Manicura",    iconName: "Hand" },
  { id: "MASSAGE",          label: "Masajes",            iconName: "HeartPulse" },
  { id: "AESTHETIC_CLINIC", label: "Clínica Estética",   iconName: "Stethoscope" },
  { id: "DENTAL",           label: "Odontología",        iconName: "Smile" },
  { id: "PHYSIOTHERAPY",    label: "Kinesiología",       iconName: "Activity" },
  { id: "PSYCHOLOGY",       label: "Psicología",         iconName: "Brain" },
  { id: "NUTRITION",        label: "Nutrición",          iconName: "Apple" },
  { id: "FITNESS_GYM",      label: "Fitness & Gym",      iconName: "Dumbbell" },
  { id: "YOGA_PILATES",     label: "Yoga & Pilates",     iconName: "Flame" },
  { id: "TATTOO",           label: "Tatuajes",           iconName: "PenTool" },
  { id: "VETERINARY",       label: "Veterinaria",        iconName: "PawPrint" },
  { id: "COACHING",         label: "Coaching",           iconName: "TrendingUp" },
  { id: "OTHER",            label: "Otro",               iconName: "LayoutGrid" },
];

export type { LucideIcon };

export const DURATION_OPTIONS = [
  { value: 15,  label: "15 min" },
  { value: 30,  label: "30 min" },
  { value: 45,  label: "45 min" },
  { value: 60,  label: "1 hora" },
  { value: 90,  label: "1h 30min" },
  { value: 120, label: "2 horas" },
];

export const DEFAULT_SCHEDULE: Record<number, DaySchedule> = {
  0: { isOpen: false, openTime: "09:00", closeTime: "18:00" }, // Dom
  1: { isOpen: true,  openTime: "09:00", closeTime: "18:00" }, // Lun
  2: { isOpen: true,  openTime: "09:00", closeTime: "18:00" }, // Mar
  3: { isOpen: true,  openTime: "09:00", closeTime: "18:00" }, // Mié
  4: { isOpen: true,  openTime: "09:00", closeTime: "18:00" }, // Jue
  5: { isOpen: true,  openTime: "09:00", closeTime: "18:00" }, // Vie
  6: { isOpen: true,  openTime: "09:00", closeTime: "14:00" }, // Sáb
};

export const ONBOARDING_PLANS = [
  {
    tier: "STARTER",
    name: "Starter",
    monthlyPrice: 19,
    annualPrice: 15,
    staff: "1 profesional",
    features: ["100 reservas/mes", "Recordatorios email", "Página pública", "POS básico"],
  },
  {
    tier: "PROFESSIONAL",
    name: "Professional",
    monthlyPrice: 49,
    annualPrice: 39,
    staff: "3 profesionales",
    features: ["500 reservas/mes", "SMS y WhatsApp", "Reportes avanzados", "Gift cards", "Inventario"],
    isPopular: true,
  },
  {
    tier: "BUSINESS",
    name: "Business",
    monthlyPrice: 99,
    annualPrice: 79,
    staff: "10 profesionales",
    features: ["Reservas ilimitadas", "3 sucursales", "Marketing por email", "Programa fidelidad", "Dominio propio"],
  },
  {
    tier: "SCALE",
    name: "Scale",
    monthlyPrice: 179,
    annualPrice: 143,
    staff: "Ilimitados",
    features: ["Todo ilimitado", "API acceso", "Soporte prioritario", "White-label opcional"],
  },
];
