export type FormFieldType =
  | "TEXT" | "TEXTAREA" | "NUMBER" | "SELECT" | "CHECKBOX"
  | "BOOLEAN" | "DATE" | "PHONE" | "EMAIL" | "SIGNATURE" | "SCALE";

export type FormType = "PRE_APPOINTMENT" | "POST_APPOINTMENT" | "INTAKE" | "CONSENT";

export type FormFieldItem = {
  id: string;
  formId: string;
  label: string;
  type: FormFieldType;
  placeholder: string | null;
  options: string[];
  isRequired: boolean;
  order: number;
  min: number | null;
  max: number | null;
  helpText: string | null;
  defaultValue: string | null;
};

export type FormItem = {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  type: FormType;
  isRequired: boolean;
  isActive: boolean;
  isConsent: boolean;
  sendBefore: number;
  sendVia: string[];
  fieldsCount: number;
  responsesCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FormDetail = FormItem & {
  fields: FormFieldItem[];
};

export type FormResponseItem = {
  id: string;
  formId: string;
  clientId: string | null;
  clientName: string | null;
  appointmentId: string | null;
  data: Record<string, unknown>;
  signedAt: string | null;
  signature: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type CreateFormInput = {
  name: string;
  description?: string | null;
  type?: FormType;
  isRequired?: boolean;
  isConsent?: boolean;
  sendBefore?: number;
  sendVia?: string[];
};

export type UpdateFormInput = Partial<CreateFormInput> & {
  isActive?: boolean;
  fields?: CreateFieldInput[];
};

export type CreateFieldInput = {
  label: string;
  type: FormFieldType;
  placeholder?: string | null;
  options?: string[];
  isRequired?: boolean;
  order?: number;
  min?: number | null;
  max?: number | null;
  helpText?: string | null;
  defaultValue?: string | null;
};

export const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  TEXT: "Texto corto",
  TEXTAREA: "Texto largo",
  NUMBER: "Número",
  SELECT: "Selector",
  CHECKBOX: "Casilla",
  BOOLEAN: "Sí / No",
  DATE: "Fecha",
  PHONE: "Teléfono",
  EMAIL: "Correo",
  SIGNATURE: "Firma digital",
  SCALE: "Escala 1–10",
};

export const FORM_TYPE_LABELS: Record<FormType, string> = {
  PRE_APPOINTMENT: "Pre-cita",
  POST_APPOINTMENT: "Post-cita",
  INTAKE: "Ficha de ingreso",
  CONSENT: "Consentimiento",
};
