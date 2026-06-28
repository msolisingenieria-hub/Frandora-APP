import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  // Sin sesión → la sign-in page se encarga de su propio renderizado
  if (!userId) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }

  // Con sesión → verificar que sea SUPER_ADMIN
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { name: true, role: true },
  });

  // Sesión válida pero sin permisos de Super Admin: mostramos acceso denegado.
  // (No redirigimos a /sign-in para evitar bucles de redirección con cookies previas.)
  if (!user || user.role !== "SUPER_ADMIN") {
    return (
      <ClerkProvider>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal">
            Zona restringida
          </p>
          <h1 className="font-sans text-xl font-semibold text-brand-navy">No tienes acceso a esta zona</h1>
          <p className="max-w-sm text-sm font-body text-slate-500">
            Tu cuenta no tiene permisos de administrador. Si crees que es un error, cierra sesión e ingresa con la cuenta correcta.
          </p>
          <code className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 select-all">
            {userId}
          </code>
        </div>
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-brand-mist/20">
        <AdminSidebar adminName={user.name} />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </ClerkProvider>
  );
}
