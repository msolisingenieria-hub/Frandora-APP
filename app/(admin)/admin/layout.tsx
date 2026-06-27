import { ClerkProvider } from "@clerk/nextjs";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireSuperAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireSuperAdmin();

  return (
    <ClerkProvider>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-brand-mist/20">
        <AdminSidebar adminName={admin.name} />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </ClerkProvider>
  );
}
