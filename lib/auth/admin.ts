import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";

export interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Verifica que el usuario actual sea SUPER_ADMIN de Frandora.
 * Si no hay sesión, redirige al login. Si no es super admin, redirige
 * al panel del negocio (no revela la existencia del admin).
 * Usar al inicio de cada layout/página y servicio del admin.
 */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, clerkId: true, email: true, name: true, avatarUrl: true, role: true },
  });

  if (!user || user.role !== "SUPER_ADMIN") redirect("/dashboard");

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
}

/**
 * Versión para route handlers de API: no redirige, retorna el usuario
 * o null para que el handler responda con 403.
 */
export async function getSuperAdmin(): Promise<AdminUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, clerkId: true, email: true, name: true, avatarUrl: true, role: true },
  });

  if (!user || user.role !== "SUPER_ADMIN") return null;

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
}
