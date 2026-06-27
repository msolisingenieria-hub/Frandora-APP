export type MembershipBillingCycle = "MONTHLY" | "QUARTERLY" | "ANNUAL";
export type ClientMembershipStatus = "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED";

export const BILLING_CYCLE_LABELS: Record<MembershipBillingCycle, string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  ANNUAL: "Anual",
};

export const MEMBERSHIP_STATUS_LABELS: Record<ClientMembershipStatus, string> = {
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  CANCELLED: "Cancelado",
  EXPIRED: "Vencido",
};

export type MembershipItem = {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: MembershipBillingCycle;
  sessionsPerCycle: number | null;
  discountPercent: number;
  color: string;
  isActive: boolean;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ClientMembershipItem = {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  membershipId: string;
  membershipName: string;
  membershipPrice: number;
  billingCycle: MembershipBillingCycle;
  status: ClientMembershipStatus;
  startDate: string;
  endDate: string;
  nextBillingDate: string | null;
  sessionsUsed: number;
  sessionsPerCycle: number | null;
  discountPercent: number;
  flowOrderId: string | null;
  notes: string | null;
  createdAt: string;
};

export type CreateMembershipInput = {
  name: string;
  description?: string | null;
  price: number;
  billingCycle?: MembershipBillingCycle;
  sessionsPerCycle?: number | null;
  discountPercent?: number;
  color?: string;
};

export type UpdateMembershipInput = Partial<CreateMembershipInput> & {
  isActive?: boolean;
};

export type AssignMembershipInput = {
  clientId: string;
  membershipId: string;
  startDate: string;
  notes?: string | null;
};
