import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getBusinessId } from "@/lib/auth/business";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const businessId = await getBusinessId(userId);
  if (!businessId) redirect("/onboarding");

  return (
    <ClerkProvider>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-brand-mist/20">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </ClerkProvider>
  );
}
