export type BeforeAfterPhotoItem = {
  id: string;
  businessId: string;
  appointmentId: string | null;
  clientId: string | null;
  clientName: string | null;
  staffId: string | null;
  staffName: string | null;
  beforeKey: string;
  afterKey: string;
  beforeUrl: string;
  afterUrl: string;
  caption: string | null;
  serviceTag: string | null;
  isPublic: boolean;
  hasConsent: boolean;
  consentAt: string | null;
  shareToken: string | null;
  shareExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBeforeAfterInput = {
  appointmentId?: string | null;
  clientId?: string | null;
  staffId?: string | null;
  beforeKey: string;
  afterKey: string;
  beforeUrl: string;
  afterUrl: string;
  caption?: string | null;
  serviceTag?: string | null;
  hasConsent?: boolean;
  isPublic?: boolean;
};

export type UpdateBeforeAfterInput = {
  caption?: string | null;
  serviceTag?: string | null;
  isPublic?: boolean;
  hasConsent?: boolean;
};
