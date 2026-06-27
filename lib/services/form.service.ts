import { prisma } from "@/lib/db/client";
import { nanoid } from "nanoid";
import type {
  FormItem, FormDetail, FormResponseItem,
  CreateFormInput, UpdateFormInput, CreateFieldInput,
} from "@/types/forms";

function mapForm(f: {
  id: string; businessId: string; name: string; description: string | null;
  type: string; isRequired: boolean; isActive: boolean; isConsent: boolean;
  sendBefore: number; sendVia: string[]; createdAt: Date; updatedAt: Date;
  _count?: { fields: number; responses: number };
}): FormItem {
  return {
    id: f.id, businessId: f.businessId, name: f.name, description: f.description,
    type: f.type as FormItem["type"], isRequired: f.isRequired, isActive: f.isActive,
    isConsent: f.isConsent, sendBefore: f.sendBefore, sendVia: f.sendVia,
    fieldsCount: f._count?.fields ?? 0, responsesCount: f._count?.responses ?? 0,
    createdAt: f.createdAt.toISOString(), updatedAt: f.updatedAt.toISOString(),
  };
}

export async function getForms(businessId: string): Promise<FormItem[]> {
  const forms = await prisma.form.findMany({
    where: { businessId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { fields: true, responses: true } } },
  });
  return forms.map(mapForm);
}

export async function getForm(businessId: string, id: string): Promise<FormDetail | null> {
  const f = await prisma.form.findFirst({
    where: { id, businessId },
    include: {
      fields: { orderBy: { order: "asc" } },
      _count: { select: { fields: true, responses: true } },
    },
  });
  if (!f) return null;
  return {
    ...mapForm(f),
    fields: f.fields.map((field) => ({
      id: field.id, formId: field.formId, label: field.label,
      type: field.type as FormDetail["fields"][0]["type"],
      placeholder: field.placeholder, options: field.options,
      isRequired: field.isRequired, order: field.order,
      min: field.min, max: field.max, helpText: field.helpText,
      defaultValue: field.defaultValue,
    })),
  };
}

export async function createForm(businessId: string, input: CreateFormInput): Promise<FormItem> {
  const f = await prisma.form.create({
    data: {
      businessId, name: input.name, description: input.description,
      type: input.type ?? "PRE_APPOINTMENT",
      isRequired: input.isRequired ?? false,
      isConsent: input.isConsent ?? false,
      sendBefore: input.sendBefore ?? 24,
      sendVia: input.sendVia ?? ["EMAIL"],
    },
    include: { _count: { select: { fields: true, responses: true } } },
  });
  return mapForm(f);
}

export async function updateForm(
  businessId: string,
  id: string,
  input: UpdateFormInput
): Promise<FormDetail | null> {
  const exists = await prisma.form.findFirst({ where: { id, businessId } });
  if (!exists) return null;

  const { fields: newFields, ...formData } = input;

  await prisma.$transaction(async (tx) => {
    await tx.form.update({ where: { id }, data: { ...formData } });
    if (newFields !== undefined) {
      await tx.formField.deleteMany({ where: { formId: id } });
      if (newFields.length > 0) {
        await tx.formField.createMany({
          data: newFields.map((f: CreateFieldInput, i: number) => ({
            formId: id, label: f.label, type: f.type,
            placeholder: f.placeholder ?? null,
            options: f.options ?? [],
            isRequired: f.isRequired ?? false,
            order: f.order ?? i,
            min: f.min ?? null, max: f.max ?? null,
            helpText: f.helpText ?? null, defaultValue: f.defaultValue ?? null,
          })),
        });
      }
    }
  });

  return getForm(businessId, id);
}

export async function deleteForm(businessId: string, id: string): Promise<boolean> {
  const exists = await prisma.form.findFirst({ where: { id, businessId } });
  if (!exists) return false;
  await prisma.form.delete({ where: { id } });
  return true;
}

export async function duplicateForm(businessId: string, id: string): Promise<FormItem | null> {
  const original = await getForm(businessId, id);
  if (!original) return null;

  const newForm = await prisma.form.create({
    data: {
      businessId, name: `${original.name} (copia)`,
      description: original.description,
      type: original.type, isRequired: original.isRequired,
      isConsent: original.isConsent, sendBefore: original.sendBefore,
      sendVia: original.sendVia,
      fields: {
        createMany: {
          data: original.fields.map((f) => ({
            label: f.label, type: f.type, placeholder: f.placeholder,
            options: f.options, isRequired: f.isRequired, order: f.order,
            min: f.min, max: f.max, helpText: f.helpText, defaultValue: f.defaultValue,
          })),
        },
      },
    },
    include: { _count: { select: { fields: true, responses: true } } },
  });
  return mapForm(newForm);
}

export async function getFormResponses(
  businessId: string,
  formId: string,
  page = 1,
  pageSize = 20
): Promise<{ responses: FormResponseItem[]; total: number }> {
  const form = await prisma.form.findFirst({ where: { id: formId, businessId } });
  if (!form) return { responses: [], total: 0 };

  const [raw, total] = await Promise.all([
    prisma.formResponse.findMany({
      where: { formId },
      skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true } } },
    }),
    prisma.formResponse.count({ where: { formId } }),
  ]);

  return {
    responses: raw.map((r) => ({
      id: r.id, formId: r.formId, clientId: r.clientId,
      clientName: r.client?.name ?? null,
      appointmentId: r.appointmentId,
      data: r.data as Record<string, unknown>,
      signedAt: r.signedAt?.toISOString() ?? null,
      signature: r.signature, completedAt: r.completedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
  };
}

export async function generateFormToken(formId: string, expiresInHours = 48): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);
  await prisma.formResponse.create({
    data: { formId, data: {}, token, expiresAt },
  });
  return token;
}
