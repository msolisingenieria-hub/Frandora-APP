import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

  if (!user || user.role !== "SUPER_ADMIN") redirect("/sign-in");

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
