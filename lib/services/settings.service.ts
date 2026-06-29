import { prisma } from "@/lib/db/client";

export type SettingsData = {
  // Datos del negocio
  name?: string;
  slug?: string;
  description?: string | null;
  phone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  // Config general
  timezone?: string;
  currency?: string;
  // Redes
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  // Políticas de reserva
  bookingAdvanceDays?: number;
  minCancelHours?: number;
  bufferMinutes?: number;
  depositPercent?: number;
  requirePayment?: boolean;
  autoConfirm?: boolean;
  allowClientCancel?: boolean;
  allowClientReschedule?: boolean;
  // Notificaciones
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  reminder24h?: boolean;
  reminder1h?: boolean;
  reviewRequestEnabled?: boolean;
};

export async function getSettings(businessId: string): Promise<SettingsData> {
  const [business, s] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true, slug: true, description: true, phone: true, website: true, logoUrl: true },
    }),
    prisma.businessSettings.findUnique({ where: { businessId } }),
  ]);

  return {
    name:        business?.name ?? "",
    slug:        business?.slug ?? "",
    description: business?.description ?? null,
    phone:       business?.phone ?? null,
    website:     business?.website ?? null,
    logoUrl:     business?.logoUrl ?? null,
    timezone:    s?.timezone ?? "America/Santiago",
    currency:    s?.currency ?? "CLP",
    instagram:   s?.socialInstagram ?? null,
    facebook:    s?.socialFacebook  ?? null,
    tiktok:      s?.socialTiktok    ?? null,
    whatsapp:    s?.socialWhatsapp  ?? null,
    bookingAdvanceDays:    s?.bookingAdvanceDays    ?? 60,
    minCancelHours:        s?.minCancelHours        ?? 24,
    bufferMinutes:         s?.bufferMinutes         ?? 0,
    depositPercent:        s?.depositPercent        ?? 0,
    requirePayment:        s?.requirePayment        ?? false,
    autoConfirm:           s?.autoConfirm           ?? true,
    allowClientCancel:     s?.allowClientCancel     ?? true,
    allowClientReschedule: s?.allowClientReschedule ?? true,
    emailEnabled:          s?.emailEnabled          ?? true,
    smsEnabled:            s?.smsEnabled            ?? false,
    whatsappEnabled:       s?.whatsappEnabled       ?? false,
    reminder24h:           s?.reminder24h           ?? true,
    reminder1h:            s?.reminder1h            ?? false,
    reviewRequestEnabled:  s?.reviewRequestEnabled  ?? true,
  };
}

export async function updateSettings(businessId: string, data: SettingsData) {
  const biz: Record<string, unknown> = {};
  if (data.name        !== undefined) biz.name        = data.name;
  if (data.description !== undefined) biz.description = data.description;
  if (data.phone       !== undefined) biz.phone       = data.phone;
  if (data.website     !== undefined) biz.website     = data.website;
  if (data.logoUrl     !== undefined) biz.logoUrl     = data.logoUrl;
  if (data.slug        !== undefined) {
    const existing = await prisma.business.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (existing && existing.id !== businessId) throw new Error("La URL publica ya esta en uso");
    biz.slug = data.slug;
  }

  const st: Record<string, unknown> = {};
  const map: [keyof SettingsData, string][] = [
    ["timezone", "timezone"], ["currency", "currency"],
    ["instagram", "socialInstagram"], ["facebook", "socialFacebook"],
    ["tiktok", "socialTiktok"], ["whatsapp", "socialWhatsapp"],
    ["bookingAdvanceDays", "bookingAdvanceDays"], ["minCancelHours", "minCancelHours"],
    ["bufferMinutes", "bufferMinutes"], ["depositPercent", "depositPercent"],
    ["requirePayment", "requirePayment"], ["autoConfirm", "autoConfirm"],
    ["allowClientCancel", "allowClientCancel"], ["allowClientReschedule", "allowClientReschedule"],
    ["emailEnabled", "emailEnabled"], ["smsEnabled", "smsEnabled"],
    ["whatsappEnabled", "whatsappEnabled"], ["reminder24h", "reminder24h"],
    ["reminder1h", "reminder1h"], ["reviewRequestEnabled", "reviewRequestEnabled"],
  ];
  for (const [key, col] of map) {
    if (data[key] !== undefined) st[col] = data[key];
  }

  await Promise.all([
    Object.keys(biz).length > 0
      ? prisma.business.update({ where: { id: businessId }, data: biz })
      : Promise.resolve(),
    Object.keys(st).length > 0
      ? prisma.businessSettings.upsert({ where: { businessId }, update: st, create: { businessId, ...st } })
      : Promise.resolve(),
  ]);
}
