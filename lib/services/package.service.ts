import { prisma } from "@/lib/db/client";
import type {
  SessionPackageItem, ClientPackageItem, CreateSessionPackageInput,
  UpdateSessionPackageInput, SellPackageInput, ClientPackageStatus,
} from "@/types/package";

function mapPackage(p: {
  id: string; businessId: string; name: string; description: string | null;
  sessions: number; price: number; validDays: number; isActive: boolean;
  createdAt: Date; updatedAt: Date;
  _count: { clientPackages: number };
}): SessionPackageItem {
  return {
    id: p.id, businessId: p.businessId, name: p.name,
    description: p.description, sessions: p.sessions, price: p.price,
    validDays: p.validDays, isActive: p.isActive,
    soldCount: p._count.clientPackages,
    createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
  };
}

function mapClientPackage(cp: {
  id: string; businessId: string; clientId: string; packageId: string;
  status: string; sessionsTotal: number; sessionsUsed: number;
  purchaseDate: Date; expiresAt: Date | null;
  flowOrderId: string | null; notes: string | null; createdAt: Date;
  client: { name: string; email: string | null };
  package: { name: string };
}): ClientPackageItem {
  return {
    id: cp.id, businessId: cp.businessId, clientId: cp.clientId,
    clientName: cp.client.name, clientEmail: cp.client.email,
    packageId: cp.packageId, packageName: cp.package.name,
    status: cp.status as ClientPackageStatus,
    sessionsTotal: cp.sessionsTotal, sessionsUsed: cp.sessionsUsed,
    sessionsRemaining: cp.sessionsTotal - cp.sessionsUsed,
    purchaseDate: cp.purchaseDate.toISOString(),
    expiresAt: cp.expiresAt?.toISOString() ?? null,
    flowOrderId: cp.flowOrderId, notes: cp.notes,
    createdAt: cp.createdAt.toISOString(),
  };
}

export async function listSessionPackages(businessId: string): Promise<SessionPackageItem[]> {
  const rows = await prisma.sessionPackage.findMany({
    where: { businessId },
    include: { _count: { select: { clientPackages: true } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapPackage);
}

export async function createSessionPackage(
  businessId: string, input: CreateSessionPackageInput
): Promise<SessionPackageItem> {
  const p = await prisma.sessionPackage.create({
    data: {
      businessId, name: input.name, description: input.description ?? null,
      sessions: input.sessions, price: input.price,
      validDays: input.validDays ?? 0,
    },
    include: { _count: { select: { clientPackages: true } } },
  });
  return mapPackage(p);
}

export async function updateSessionPackage(
  businessId: string, id: string, input: UpdateSessionPackageInput
): Promise<SessionPackageItem | null> {
  const exists = await prisma.sessionPackage.findFirst({ where: { id, businessId } });
  if (!exists) return null;
  const p = await prisma.sessionPackage.update({
    where: { id },
    data: {
      name: input.name, description: input.description,
      sessions: input.sessions, price: input.price,
      validDays: input.validDays, isActive: input.isActive,
    },
    include: { _count: { select: { clientPackages: true } } },
  });
  return mapPackage(p);
}

export async function deleteSessionPackage(businessId: string, id: string): Promise<boolean> {
  const exists = await prisma.sessionPackage.findFirst({ where: { id, businessId } });
  if (!exists) return false;
  await prisma.sessionPackage.delete({ where: { id } });
  return true;
}

export async function sellPackageToClient(
  businessId: string, input: SellPackageInput
): Promise<ClientPackageItem> {
  const pkg = await prisma.sessionPackage.findFirst({ where: { id: input.packageId, businessId, isActive: true } });
  if (!pkg) throw new Error("Paquete no encontrado o inactivo");

  const purchaseDate = new Date();
  const expiresAt = pkg.validDays > 0
    ? new Date(purchaseDate.getTime() + pkg.validDays * 86400 * 1000)
    : null;

  const cp = await prisma.clientPackage.create({
    data: {
      businessId, clientId: input.clientId, packageId: input.packageId,
      status: "ACTIVE", sessionsTotal: pkg.sessions, sessionsUsed: 0,
      purchaseDate, expiresAt, notes: input.notes ?? null,
    },
    include: {
      client: { select: { name: true, email: true } },
      package: { select: { name: true } },
    },
  });
  return mapClientPackage(cp);
}

export async function listClientPackages(
  businessId: string,
  clientId?: string,
  status?: ClientPackageStatus
): Promise<ClientPackageItem[]> {
  const rows = await prisma.clientPackage.findMany({
    where: { businessId, ...(clientId ? { clientId } : {}), ...(status ? { status } : {}) },
    include: {
      client: { select: { name: true, email: true } },
      package: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapClientPackage);
}

export async function useSession(
  businessId: string, clientPackageId: string, count = 1
): Promise<ClientPackageItem | null> {
  const cp = await prisma.clientPackage.findFirst({
    where: { id: clientPackageId, businessId, status: "ACTIVE" },
  });
  if (!cp) return null;

  const remaining = cp.sessionsTotal - cp.sessionsUsed;
  if (remaining < count) throw new Error("Sesiones insuficientes en el paquete");

  const newUsed = cp.sessionsUsed + count;
  const isDepleted = newUsed >= cp.sessionsTotal;
  const isExpired = cp.expiresAt ? cp.expiresAt < new Date() : false;

  const updated = await prisma.clientPackage.update({
    where: { id: clientPackageId },
    data: {
      sessionsUsed: newUsed,
      status: isDepleted ? "DEPLETED" : isExpired ? "EXPIRED" : "ACTIVE",
    },
    include: {
      client: { select: { name: true, email: true } },
      package: { select: { name: true } },
    },
  });
  return mapClientPackage(updated);
}

export async function getClientActivePackages(
  businessId: string, clientId: string
): Promise<ClientPackageItem[]> {
  const now = new Date();
  const rows = await prisma.clientPackage.findMany({
    where: {
      businessId, clientId, status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      client: { select: { name: true, email: true } },
      package: { select: { name: true } },
    },
  });
  return rows.map(mapClientPackage);
}
