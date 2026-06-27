import { prisma } from "@/lib/db/client";
import { audit } from "@/lib/audit/log";
import type { BusinessStatus, PlanTier } from "@prisma/client";

export type BusinessSortField = "name" | "createdAt" | "status";

export interface BusinessListFilters {
  search?: string;
  status?: BusinessStatus;
  plan?: PlanTier;
  page?: number;
  perPage?: number;
  sort?: BusinessSortField;
  dir?: "asc" | "desc";
}

export interface BusinessListItem {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  status: BusinessStatus;
  createdAt: Date;
  owner: { name: string; email: string };
  subscription: {
    plan: { tier: PlanTier; name: string };
    status: string;
    isAnnual: boolean;
  } | null;
  _count: { clients: number; appointments: number };
}

export interface BusinessDetail extends BusinessListItem {
  phone: string | null;
  category: string;
  notes: {
    id: string;
    content: string;
    isPinned: boolean;
    authorId: string;
    createdAt: Date;
  }[];
}

export async function listBusinesses(filters: BusinessListFilters = {}): Promise<{
  items: BusinessListItem[];
  total: number;
}> {
  const { search, status, plan, page = 1, perPage = 25, sort = "createdAt", dir = "desc" } = filters;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
        { owner: { email: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
    ...(plan && { subscription: { plan: { tier: plan } } }),
  };

  const [items, total] = await Promise.all([
    prisma.business.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { [sort]: dir },
      select: {
        id: true, name: true, slug: true, email: true, status: true, createdAt: true,
        owner: { select: { name: true, email: true } },
        subscription: {
          select: {
            status: true, isAnnual: true,
            plan: { select: { tier: true, name: true } },
          },
        },
        _count: { select: { clients: true, appointments: true } },
      },
    }),
    prisma.business.count({ where }),
  ]);

  return { items: items as BusinessListItem[], total };
}

export async function getBusinessDetail(businessId: string): Promise<BusinessDetail | null> {
  const biz = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true, name: true, slug: true, email: true, phone: true, category: true,
      status: true, createdAt: true,
      owner: { select: { name: true, email: true } },
      subscription: {
        select: {
          status: true, isAnnual: true,
          plan: { select: { tier: true, name: true } },
        },
      },
      adminNotes: {
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        select: { id: true, content: true, isPinned: true, authorId: true, createdAt: true },
      },
      _count: { select: { clients: true, appointments: true } },
    },
  });

  if (!biz) return null;
  return biz as unknown as BusinessDetail;
}

export async function suspendBusiness(businessId: string, adminId: string): Promise<void> {
  await prisma.business.update({
    where: { id: businessId },
    data: { status: "SUSPENDED" },
  });
  await audit({
    userId: adminId,
    businessId,
    action: "ADMIN_SUSPEND_BUSINESS",
    resource: "business",
    resourceId: businessId,
  });
}

export async function reactivateBusiness(businessId: string, adminId: string): Promise<void> {
  await prisma.business.update({
    where: { id: businessId },
    data: { status: "ACTIVE" },
  });
  await audit({
    userId: adminId,
    businessId,
    action: "ADMIN_REACTIVATE_BUSINESS",
    resource: "business",
    resourceId: businessId,
  });
}

export async function changeBusinessPlan(
  businessId: string,
  planTier: PlanTier,
  adminId: string,
): Promise<void> {
  const plan = await prisma.plan.findUnique({ where: { tier: planTier } });
  if (!plan) throw new Error("Plan no encontrado");

  await prisma.subscription.update({
    where: { businessId },
    data: { planId: plan.id },
  });
  await audit({
    userId: adminId,
    businessId,
    action: "ADMIN_CHANGE_PLAN",
    resource: "subscription",
    resourceId: businessId,
    metadata: { newPlan: planTier },
  });
}

export async function addBusinessNote(
  businessId: string,
  content: string,
  authorId: string,
): Promise<void> {
  await prisma.businessNote.create({
    data: { businessId, content, authorId },
  });
  await audit({
    userId: authorId,
    businessId,
    action: "ADMIN_ADD_NOTE",
    resource: "business",
    resourceId: businessId,
  });
}

export async function logImpersonation(businessId: string, adminId: string): Promise<void> {
  await audit({
    userId: adminId,
    businessId,
    action: "ADMIN_IMPERSONATE",
    resource: "business",
    resourceId: businessId,
    metadata: { mode: "read_only" },
  });
}
