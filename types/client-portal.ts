export type PortalAppointment = {
  id: string;
  serviceName: string;
  staffName: string | null;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  paymentStatus: string;
  canCancel: boolean;
};

export type PortalMembership = {
  id: string;
  membershipName: string;
  status: string;
  startDate: string;
  endDate: string;
  sessionsUsed: number;
  sessionsPerCycle: number | null;
  discountPercent: number;
  billingCycle: string;
};

export type PortalPackage = {
  id: string;
  packageName: string;
  status: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  purchaseDate: string;
  expiresAt: string | null;
};

export type PortalData = {
  client: {
    id: string;
    name: string;
    email: string | null;
    loyaltyPoints: number;
    avatarUrl: string | null;
  };
  business: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  upcomingAppointments: PortalAppointment[];
  pastAppointments: PortalAppointment[];
  activeMembership: PortalMembership | null;
  activePackages: PortalPackage[];
};
