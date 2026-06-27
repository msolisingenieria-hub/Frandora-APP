import { prisma } from "@/lib/db/client";
import type {
  SoapNoteItem, SoapTemplateItem, SoapExtraField,
  CreateSoapNoteInput, UpdateSoapNoteInput,
  CreateSoapTemplateInput, UpdateSoapTemplateInput,
} from "@/types/soap";

function mapNote(n: {
  id: string; businessId: string; clientId: string | null;
  client: { name: string } | null; appointmentId: string | null;
  staffId: string | null; staff: { name: string } | null;
  templateId: string | null; subjective: string; objective: string;
  assessment: string; plan: string; extraFields: unknown;
  isPrivate: boolean; createdAt: Date; updatedAt: Date;
}): SoapNoteItem {
  return {
    id: n.id, businessId: n.businessId, clientId: n.clientId,
    clientName: n.client?.name ?? null, appointmentId: n.appointmentId,
    staffId: n.staffId, staffName: n.staff?.name ?? null,
    templateId: n.templateId, subjective: n.subjective, objective: n.objective,
    assessment: n.assessment, plan: n.plan,
    extraFields: (n.extraFields as Record<string, unknown>) ?? {},
    isPrivate: n.isPrivate,
    createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString(),
  };
}

export async function getSoapNotes(
  businessId: string,
  options: { clientId?: string; appointmentId?: string; page?: number; pageSize?: number } = {}
): Promise<{ notes: SoapNoteItem[]; total: number }> {
  const { clientId, appointmentId, page = 1, pageSize = 20 } = options;
  const where = {
    businessId,
    ...(clientId ? { clientId } : {}),
    ...(appointmentId ? { appointmentId } : {}),
  };
  const [raw, total] = await Promise.all([
    prisma.soapNote.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true } },
        staff: { select: { name: true } },
      },
    }),
    prisma.soapNote.count({ where }),
  ]);
  return { notes: raw.map(mapNote), total };
}

export async function getSoapNote(businessId: string, id: string): Promise<SoapNoteItem | null> {
  const n = await prisma.soapNote.findFirst({
    where: { id, businessId },
    include: {
      client: { select: { name: true } },
      staff: { select: { name: true } },
    },
  });
  return n ? mapNote(n) : null;
}

export async function createSoapNote(
  businessId: string,
  input: CreateSoapNoteInput
): Promise<SoapNoteItem> {
  const n = await prisma.soapNote.create({
    data: {
      businessId, clientId: input.clientId ?? null,
      appointmentId: input.appointmentId ?? null,
      staffId: input.staffId ?? null,
      templateId: input.templateId ?? null,
      subjective: input.subjective, objective: input.objective,
      assessment: input.assessment, plan: input.plan,
      extraFields: (input.extraFields ?? {}) as object,
      isPrivate: input.isPrivate ?? true,
    },
    include: {
      client: { select: { name: true } },
      staff: { select: { name: true } },
    },
  });
  return mapNote(n);
}

export async function updateSoapNote(
  businessId: string,
  id: string,
  input: UpdateSoapNoteInput
): Promise<SoapNoteItem | null> {
  const exists = await prisma.soapNote.findFirst({ where: { id, businessId } });
  if (!exists) return null;
  const n = await prisma.soapNote.update({
    where: { id },
    data: { ...input, extraFields: input.extraFields as object | undefined },
    include: {
      client: { select: { name: true } },
      staff: { select: { name: true } },
    },
  });
  return mapNote(n);
}

export async function deleteSoapNote(businessId: string, id: string): Promise<boolean> {
  const exists = await prisma.soapNote.findFirst({ where: { id, businessId } });
  if (!exists) return false;
  await prisma.soapNote.delete({ where: { id } });
  return true;
}

export async function getSoapTemplates(businessId: string): Promise<SoapTemplateItem[]> {
  const templates = await prisma.soapTemplate.findMany({
    where: { businessId, isActive: true },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return templates.map((t) => ({
    id: t.id, businessId: t.businessId, name: t.name, serviceId: t.serviceId,
    extraFields: (t.extraFields as SoapExtraField[]) ?? [],
    isDefault: t.isDefault, isActive: t.isActive,
    createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
  }));
}

export async function createSoapTemplate(
  businessId: string,
  input: CreateSoapTemplateInput
): Promise<SoapTemplateItem> {
  if (input.isDefault) {
    await prisma.soapTemplate.updateMany({ where: { businessId }, data: { isDefault: false } });
  }
  const t = await prisma.soapTemplate.create({
    data: {
      businessId, name: input.name, serviceId: input.serviceId ?? null,
      extraFields: (input.extraFields ?? []) as object,
      isDefault: input.isDefault ?? false,
    },
  });
  return {
    id: t.id, businessId: t.businessId, name: t.name, serviceId: t.serviceId,
    extraFields: (t.extraFields as SoapExtraField[]) ?? [],
    isDefault: t.isDefault, isActive: t.isActive,
    createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
  };
}

export async function updateSoapTemplate(
  businessId: string,
  id: string,
  input: UpdateSoapTemplateInput
): Promise<SoapTemplateItem | null> {
  const exists = await prisma.soapTemplate.findFirst({ where: { id, businessId } });
  if (!exists) return null;
  if (input.isDefault) {
    await prisma.soapTemplate.updateMany({ where: { businessId }, data: { isDefault: false } });
  }
  const t = await prisma.soapTemplate.update({
    where: { id },
    data: { ...input, extraFields: input.extraFields as object | undefined },
  });
  return {
    id: t.id, businessId: t.businessId, name: t.name, serviceId: t.serviceId,
    extraFields: (t.extraFields as SoapExtraField[]) ?? [],
    isDefault: t.isDefault, isActive: t.isActive,
    createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
  };
}

export async function deleteSoapTemplate(businessId: string, id: string): Promise<boolean> {
  const exists = await prisma.soapTemplate.findFirst({ where: { id, businessId } });
  if (!exists) return false;
  await prisma.soapTemplate.delete({ where: { id } });
  return true;
}
