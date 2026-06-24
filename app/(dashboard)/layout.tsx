import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <ClerkProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-brand-mist/20">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ClerkProvider>
  );
}
