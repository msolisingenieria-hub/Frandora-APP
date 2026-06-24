import { prisma } from "@/lib/db/client";

export type SettingsData = {
  name?: string;
  slug?: string;
  description?: string | null;
  phone?: string | null;
  website?: string | null;
  timezone?: string;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
};

export async function getSettings(businessId: string): Promise<SettingsData> {
  const [business, bSettings] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true, slug: true, description: true, phone: true, website: true },
    }),
    prisma.businessSettings.findUnique({
      where: { businessId },
      select: { timezone: true, socialInstagram: true, socialFacebook: true, socialTiktok: true, socialWhatsapp: true },
    }),
  ]);

  return {
    name:        business?.name ?? "",
    slug:        business?.slug ?? "",
    description: business?.description ?? null,
    phone:       business?.phone ?? null,
    website:     business?.website ?? null,
    timezone:    bSettings?.timezone ?? "America/Santiago",
    instagram:   bSettings?.socialInstagram ?? null,
    facebook:    bSettings?.socialFacebook  ?? null,
    tiktok:      bSettings?.socialTiktok    ?? null,
    whatsapp:    bSettings?.socialWhatsapp  ?? null,
  };
}

export async function updateSettings(businessId: string, data: SettingsData) {
  const businessUpdate: Record<string, unknown> = {};
  if (data.name        !== undefined) businessUpdate.name        = data.name;
  if (data.description !== undefined) businessUpdate.description = data.description;
  if (data.phone       !== undefined) businessUpdate.phone       = data.phone;
  if (data.website     !== undefined) businessUpdate.website     = data.website;

  const settingsUpdate: Record<string, unknown> = {};
  if (data.timezone  !== undefined) settingsUpdate.timezone        = data.timezone;
  if (data.instagram !== undefined) settingsUpdate.socialInstagram = data.instagram;
  if (data.facebook  !== undefined) settingsUpdate.socialFacebook  = data.facebook;
  if (data.tiktok    !== undefined) settingsUpdate.socialTiktok    = data.tiktok;
  if (data.whatsapp  !== undefined) settingsUpdate.socialWhatsapp  = data.whatsapp;

  await Promise.all([
    Object.keys(businessUpdate).length > 0
      ? prisma.business.update({ where: { id: businessId }, data: businessUpdate })
      : Promise.resolve(),
    Object.keys(settingsUpdate).length > 0
      ? prisma.businessSettings.upsert({
          where:  { businessId },
          update: settingsUpdate,
          create: { businessId, ...settingsUpdate },
        })
      : Promise.resolve(),
  ]);
}
