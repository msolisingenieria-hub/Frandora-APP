export type SoapNoteItem = {
  id: string;
  businessId: string;
  clientId: string | null;
  clientName: string | null;
  appointmentId: string | null;
  staffId: string | null;
  staffName: string | null;
  templateId: string | null;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  extraFields: Record<string, unknown>;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SoapTemplateItem = {
  id: string;
  businessId: string;
  name: string;
  serviceId: string | null;
  extraFields: SoapExtraField[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SoapExtraField = {
  key: string;
  label: string;
  type: "text" | "number" | "boolean";
};

export type CreateSoapNoteInput = {
  clientId?: string | null;
  appointmentId?: string | null;
  staffId?: string | null;
  templateId?: string | null;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  extraFields?: Record<string, unknown>;
  isPrivate?: boolean;
};

export type UpdateSoapNoteInput = Partial<Omit<CreateSoapNoteInput, "clientId">>;

export type CreateSoapTemplateInput = {
  name: string;
  serviceId?: string | null;
  extraFields?: SoapExtraField[];
  isDefault?: boolean;
};

export type UpdateSoapTemplateInput = Partial<CreateSoapTemplateInput> & {
  isActive?: boolean;
};

export const SOAP_LABELS = {
  subjective: { letter: "S", title: "Subjetivo", description: "Lo que reporta el paciente", placeholder: "Síntomas, queja principal, historia…" },
  objective: { letter: "O", title: "Objetivo", description: "Observaciones clínicas", placeholder: "Signos vitales, examen físico, resultados…" },
  assessment: { letter: "A", title: "Evaluación", description: "Diagnóstico y análisis", placeholder: "Diagnóstico, progreso, impresión clínica…" },
  plan: { letter: "P", title: "Plan", description: "Tratamiento y próximos pasos", placeholder: "Tratamiento indicado, próxima cita, derivaciones…" },
} as const;
