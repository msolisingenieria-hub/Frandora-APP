import { prisma } from "@/lib/db/client";
import { nanoid } from "nanoid";
import { deleteFile } from "@/lib/storage/upload";
import type { BeforeAfterPhotoItem, CreateBeforeAfterInput, UpdateBeforeAfterInput } from "@/types/before-after";

function mapPhoto(p: {
  id: string; businessId: string; appointmentId: string | null;
  clientId: string | null; client: { name: string } | null;
  staffId: string | null; staff: { name: string } | null;
  beforeKey: string; afterKey: string; beforeUrl: string; afterUrl: string;
  caption: string | null; serviceTag: string | null; isPublic: boolean;
  hasConsent: boolean; consentAt: Date | null; shareToken: string | null;
  shareExpiresAt: Date | null; createdAt: Date; updatedAt: Date;
}): BeforeAfterPhotoItem {
  return {
    id: p.id, businessId: p.businessId, appointmentId: p.appointmentId,
    clientId: p.clientId, clientName: p.client?.name ?? null,
    staffId: p.staffId, staffName: p.staff?.name ?? null,
    beforeKey: p.beforeKey, afterKey: p.afterKey,
    beforeUrl: p.beforeUrl, afterUrl: p.afterUrl,
    caption: p.caption, serviceTag: p.serviceTag, isPublic: p.isPublic,
    hasConsent: p.hasConsent, consentAt: p.consentAt?.toISOString() ?? null,
    shareToken: p.shareToken, shareExpiresAt: p.shareExpiresAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
  };
}

const INCLUDE = {
  client: { select: { name: true } },
  staff: { select: { name: true } },
} as const;

export async function getBeforeAfterPhotos(
  businessId: string,
  options: {
    staffId?: string; serviceTag?: string; isPublic?: boolean;
    page?: number; pageSize?: number;
  } = {}
): Promise<{ photos: BeforeAfterPhotoItem[]; total: number }> {
  const { staffId, serviceTag, isPublic, page = 1, pageSize = 20 } = options;
  const where = {
    businessId,
    ...(staffId ? { staffId } : {}),
    ...(serviceTag ? { serviceTag } : {}),
    ...(isPublic !== undefined ? { isPublic } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.beforeAfterPhoto.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { createdAt: "desc" },
      include: INCLUDE,
    }),
    prisma.beforeAfterPhoto.count({ where }),
  ]);
  return { photos: raw.map(mapPhoto), total };
}

export async function getBeforeAfterPhoto(
  businessId: string,
  id: string
): Promise<BeforeAfterPhotoItem | null> {
  const p = await prisma.beforeAfterPhoto.findFirst({
    where: { id, businessId },
    include: INCLUDE,
  });
  return p ? mapPhoto(p) : null;
}

export async function createBeforeAfterPhoto(
  businessId: string,
  input: CreateBeforeAfterInput
): Promise<BeforeAfterPhotoItem> {
  const p = await prisma.beforeAfterPhoto.create({
    data: {
      businessId,
      appointmentId: input.appointmentId ?? null,
      clientId: input.clientId ?? null,
      staffId: input.staffId ?? null,
      beforeKey: input.beforeKey, afterKey: input.afterKey,
      beforeUrl: input.beforeUrl, afterUrl: input.afterUrl,
      caption: input.caption ?? null, serviceTag: input.serviceTag ?? null,
      hasConsent: input.hasConsent ?? false,
      consentAt: input.hasConsent ? new Date() : null,
      isPublic: input.isPublic ?? false,
    },
    include: INCLUDE,
  });
  return mapPhoto(p);
}

export async function updateBeforeAfterPhoto(
  businessId: string,
  id: string,
  input: UpdateBeforeAfterInput
): Promise<BeforeAfterPhotoItem | null> {
  const exists = await prisma.beforeAfterPhoto.findFirst({ where: { id, businessId } });
  if (!exists) return null;
  const data: Record<string, unknown> = { ...input };
  if (input.hasConsent && !exists.hasConsent) data.consentAt = new Date();
  const p = await prisma.beforeAfterPhoto.update({
    where: { id },
    data,
    include: INCLUDE,
  });
  return mapPhoto(p);
}

export async function deleteBeforeAfterPhoto(businessId: string, id: string): Promise<boolean> {
  const photo = await prisma.beforeAfterPhoto.findFirst({ where: { id, businessId } });
  if (!photo) return false;
  await Promise.allSettled([deleteFile(photo.beforeKey), deleteFile(photo.afterKey)]);
  await prisma.beforeAfterPhoto.delete({ where: { id } });
  return true;
}

export async function generateShareToken(
  businessId: string,
  id: string,
  expiresInDays = 30
): Promise<string | null> {
  const exists = await prisma.beforeAfterPhoto.findFirst({ where: { id, businessId } });
  if (!exists) return null;
  const token = nanoid(24);
  const expiresAt = new Date(Date.now() + expiresInDays * 86400 * 1000);
  await prisma.beforeAfterPhoto.update({
    where: { id },
    data: { shareToken: token, shareExpiresAt: expiresAt },
  });
  return token;
}
