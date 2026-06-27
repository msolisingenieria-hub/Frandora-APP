import { prisma } from "@/lib/db/client";
import { nanoid } from "nanoid";
import type { PortalData, PortalAppointment, PortalMembership, PortalPackage } from "@/types/client-portal";

export async function generatePortalToken(
  businessId: string,
  clientId: string,
  expiresInDays = 90
): Promise<string> {
  const client = await prisma.client.findFirst({ where: { id: clientId, businessId } });
  if (!client) throw new Error("Cliente no encontrado");

  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + expiresInDays * 86400 * 1000);

  await prisma.clientPortalToken.deleteMany({ where: { clientId, businessId } });
  await prisma.clientPortalToken.create({ data: { businessId, clientId, token, expiresAt } });

  return token;
}

export async function getPortalData(token: string): Promise<PortalData | null> {
  const portalToken = await prisma.clientPortalToken.findUnique({
    where: { token },
    include: {
      client: {
        select: { id: true, name: true, email: true, loyaltyPoints: true, avatarUrl: true },
      },
      business: {
        select: { id: true, name: true, logoUrl: true },
      },
    },
  });

  if (!portalToken || portalToken.expiresAt < new Date()) return null;

  await prisma.clientPortalToken.update({
    where: { token },
    data: { lastAccessAt: new Date() },
  });

  const { client, business } = portalToken;
  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: {
      businessId: portalToken.businessId,
      clients: { some: { clientId: client.id } },
    },
    include: {
      services: { include: { service: { select: { name: true } } } },
      staff: { select: { name: true } },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: { startTime: "desc" },
    take: 30,
  });

  const upcoming: PortalAppointment[] = [];
  const past: PortalAppointment[] = [];

  for (const apt of appointments) {
    const serviceName = apt.services[0]?.service?.name ?? "Servicio";
    const payment = apt.payment;
    const item: PortalAppointment = {
      id: apt.id,
      serviceName,
      staffName: apt.staff?.name ?? null,
      startTime: apt.startTime.toISOString(),
      endTime: apt.endTime.toISOString(),
      status: apt.status,
      price: payment?.amount ?? 0,
      paymentStatus: payment?.status ?? "PENDING",
      canCancel: apt.startTime > now && apt.status !== "CANCELED",
    };
    if (apt.startTime >= now) upcoming.push(item);
    else past.push(item);
  }

  const activeMembership = await prisma.clientMembership.findFirst({
    where: { clientId: client.id, businessId: portalToken.businessId, status: "ACTIVE" },
    include: { membership: { select: { name: true, billingCycle: true, sessionsPerCycle: true, discountPercent: true } } },
  });

  const activePackages = await prisma.clientPackage.findMany({
    where: {
      clientId: client.id, businessId: portalToken.businessId, status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: { package: { select: { name: true } } },
  });

  const membership: PortalMembership | null = activeMembership ? {
    id: activeMembership.id,
    membershipName: activeMembership.membership.name,
    status: activeMembership.status,
    startDate: activeMembership.startDate.toISOString(),
    endDate: activeMembership.endDate.toISOString(),
    sessionsUsed: activeMembership.sessionsUsed,
    sessionsPerCycle: activeMembership.membership.sessionsPerCycle,
    discountPercent: activeMembership.membership.discountPercent,
    billingCycle: activeMembership.membership.billingCycle,
  } : null;

  const packages: PortalPackage[] = activePackages.map((cp: typeof activePackages[0]) => ({
    id: cp.id,
    packageName: cp.package.name,
    status: cp.status,
    sessionsTotal: cp.sessionsTotal,
    sessionsUsed: cp.sessionsUsed,
    sessionsRemaining: cp.sessionsTotal - cp.sessionsUsed,
    purchaseDate: cp.purchaseDate.toISOString(),
    expiresAt: cp.expiresAt?.toISOString() ?? null,
  }));

  return {
    client: {
      id: client.id, name: client.name, email: client.email,
      loyaltyPoints: client.loyaltyPoints, avatarUrl: client.avatarUrl,
    },
    business: { id: business.id, name: business.name, logoUrl: business.logoUrl },
    upcomingAppointments: upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    pastAppointments: past.slice(0, 10),
    activeMembership: membership,
    activePackages: packages,
  };
}

export async function cancelPortalAppointment(
  token: string,
  appointmentId: string
): Promise<boolean> {
  const portalToken = await prisma.clientPortalToken.findUnique({ where: { token } });
  if (!portalToken || portalToken.expiresAt < new Date()) return false;

  const apt = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      businessId: portalToken.businessId,
      clients: { some: { clientId: portalToken.clientId } },
      startTime: { gt: new Date() },
      status: { notIn: ["CANCELED", "COMPLETED", "NO_SHOW"] },
    },
  });
  if (!apt) return false;

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELED" } });
  return true;
}
