export type ClientPackageStatus = "ACTIVE" | "DEPLETED" | "EXPIRED" | "CANCELLED";

export const PACKAGE_STATUS_LABELS: Record<ClientPackageStatus, string> = {
  ACTIVE: "Activo",
  DEPLETED: "Agotado",
  EXPIRED: "Vencido",
  CANCELLED: "Cancelado",
};

export type SessionPackageItem = {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  sessions: number;
  price: number;
  validDays: number;
  isActive: boolean;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ClientPackageItem = {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  packageId: string;
  packageName: string;
  status: ClientPackageStatus;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  purchaseDate: string;
  expiresAt: string | null;
  flowOrderId: string | null;
  notes: string | null;
  createdAt: string;
};

export type CreateSessionPackageInput = {
  name: string;
  description?: string | null;
  sessions: number;
  price: number;
  validDays?: number;
};

export type UpdateSessionPackageInput = Partial<CreateSessionPackageInput> & {
  isActive?: boolean;
};

export type SellPackageInput = {
  clientId: string;
  packageId: string;
  notes?: string | null;
};

export type UseSessionInput = {
  clientPackageId: string;
  sessionsToUse?: number;
};
