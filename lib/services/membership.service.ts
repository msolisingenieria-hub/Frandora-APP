import { prisma } from "@/lib/db/client";
import type {
  MembershipItem, ClientMembershipItem, CreateMembershipInput,
  UpdateMembershipInput, AssignMembershipInput, MembershipBillingCycle,
  ClientMembershipStatus,
} from "@/types/membership";

function cycleDays(cycle: MembershipBillingCycle): number {
  if (cycle === "MONTHLY") return 30;
  if (cycle === "QUARTERLY") return 90;
  return 365;
}

function mapMembership(m: {
  id: string; businessId: string; name: string; description: string | null;
  price: number; billingCycle: string; sessionsPerCycle: number | null;
  discountPercent: number; color: string; isActive: boolean;
  createdAt: Date; updatedAt: Date;
  _count: { clientMemberships: number };
}): MembershipItem {
  return {
    id: m.id, businessId: m.businessId, name: m.name,
    description: m.description, price: m.price,
    billingCycle: m.billingCycle as MembershipBillingCycle,
    sessionsPerCycle: m.sessionsPerCycle, discountPercent: m.discountPercent,
    color: m.color, isActive: m.isActive,
    subscriberCount: m._count.clientMemberships,
    createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString(),
  };
}

function mapClientMembership(cm: {
  id: string; businessId: string; clientId: string; membershipId: string;
  status: string; startDate: Date; endDate: Date; nextBillingDate: Date | null;
  sessionsUsed: number; flowOrderId: string | null; notes: string | null;
  createdAt: Date;
  client: { name: string; email: string | null };
  membership: { name: string; price: number; billingCycle: string; sessionsPerCycle: number | null; discountPercent: number };
}): ClientMembershipItem {
  return {
    id: cm.id, businessId: cm.businessId, clientId: cm.clientId,
    clientName: cm.client.name, clientEmail: cm.client.email,
    membershipId: cm.membershipId,
    membershipName: cm.membership.name, membershipPrice: cm.membership.price,
    billingCycle: cm.membership.billingCycle as MembershipBillingCycle,
    status: cm.status as ClientMembershipStatus,
    startDate: cm.startDate.toISOString(), endDate: cm.endDate.toISOString(),
    nextBillingDate: cm.nextBillingDate?.toISOString() ?? null,
    sessionsUsed: cm.sessionsUsed,
    sessionsPerCycle: cm.membership.sessionsPerCycle,
    discountPercent: cm.membership.discountPercent,
    flowOrderId: cm.flowOrderId, notes: cm.notes,
    createdAt: cm.createdAt.toISOString(),
  };
}

export async function listMemberships(businessId: string): Promise<MembershipItem[]> {
  const rows = await prisma.membership.findMany({
    where: { businessId },
    include: { _count: { select: { clientMemberships: { where: { status: "ACTIVE" } } } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapMembership);
}

export async function getMembership(businessId: string, id: string): Promise<MembershipItem | null> {
  const m = await prisma.membership.findFirst({
    where: { id, businessId },
    include: { _count: { select: { clientMemberships: { where: { status: "ACTIVE" } } } } },
  });
  return m ? mapMembership(m) : null;
}

export async function createMembership(businessId: string, input: CreateMembershipInput): Promise<MembershipItem> {
  const m = await prisma.membership.create({
    data: {
      businessId, name: input.name, description: input.description ?? null,
      price: input.price, billingCycle: input.billingCycle ?? "MONTHLY",
      sessionsPerCycle: input.sessionsPerCycle ?? null,
      discountPercent: input.discountPercent ?? 0,
      color: input.color ?? "#6FA89E",
    },
    include: { _count: { select: { clientMemberships: true } } },
  });
  return mapMembership(m);
}

export async function updateMembership(
  businessId: string, id: string, input: UpdateMembershipInput
): Promise<MembershipItem | null> {
  const exists = await prisma.membership.findFirst({ where: { id, businessId } });
  if (!exists) return null;
  const m = await prisma.membership.update({
    where: { id },
    data: {
      name: input.name, description: input.description,
      price: input.price, billingCycle: input.billingCycle,
      sessionsPerCycle: input.sessionsPerCycle, discountPercent: input.discountPercent,
      color: input.color, isActive: input.isActive,
    },
    include: { _count: { select: { clientMemberships: { where: { status: "ACTIVE" } } } } },
  });
  return mapMembership(m);
}

export async function deleteMembership(businessId: string, id: string): Promise<boolean> {
  const exists = await prisma.membership.findFirst({ where: { id, businessId } });
  if (!exists) return false;
  await prisma.membership.delete({ where: { id } });
  return true;
}

export async function listSubscribers(
  businessId: string,
  status?: ClientMembershipStatus
): Promise<ClientMembershipItem[]> {
  const rows = await prisma.clientMembership.findMany({
    where: { businessId, ...(status ? { status } : {}) },
    include: {
      client: { select: { name: true, email: true } },
      membership: { select: { name: true, price: true, billingCycle: true, sessionsPerCycle: true, discountPercent: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapClientMembership);
}

export async function assignMembership(
  businessId: string,
  input: AssignMembershipInput
): Promise<ClientMembershipItem> {
  const membership = await prisma.membership.findFirst({ where: { id: input.membershipId, businessId } });
  if (!membership) throw new Error("Membresía no encontrada");

  const startDate = new Date(input.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + cycleDays(membership.billingCycle as MembershipBillingCycle));

  const nextBillingDate = new Date(endDate);

  const cm = await prisma.clientMembership.create({
    data: {
      businessId, clientId: input.clientId, membershipId: input.membershipId,
      status: "ACTIVE", startDate, endDate, nextBillingDate,
      notes: input.notes ?? null,
    },
    include: {
      client: { select: { name: true, email: true } },
      membership: { select: { name: true, price: true, billingCycle: true, sessionsPerCycle: true, discountPercent: true } },
    },
  });
  return mapClientMembership(cm);
}

export async function updateClientMembershipStatus(
  businessId: string, id: string, status: ClientMembershipStatus
): Promise<ClientMembershipItem | null> {
  const exists = await prisma.clientMembership.findFirst({ where: { id, businessId } });
  if (!exists) return null;
  const cm = await prisma.clientMembership.update({
    where: { id },
    data: { status },
    include: {
      client: { select: { name: true, email: true } },
      membership: { select: { name: true, price: true, billingCycle: true, sessionsPerCycle: true, discountPercent: true } },
    },
  });
  return mapClientMembership(cm);
}

export async function getMembershipMRR(businessId: string): Promise<number> {
  const active = await prisma.clientMembership.findMany({
    where: { businessId, status: "ACTIVE" },
    include: { membership: { select: { price: true, billingCycle: true } } },
  });
  return active.reduce((sum, cm) => {
    const p = cm.membership.price;
    if (cm.membership.billingCycle === "MONTHLY") return sum + p;
    if (cm.membership.billingCycle === "QUARTERLY") return sum + p / 3;
    return sum + p / 12;
  }, 0);
}
