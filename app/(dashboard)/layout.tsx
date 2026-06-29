import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BusinessThemeInjector } from "@/components/providers/BusinessThemeInjector";
import { getBusinessId, getUserBusinesses } from "@/lib/auth/business";
import { prisma } from "@/lib/db/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const businessId = await getBusinessId(userId);
  if (!businessId) redirect("/onboarding");

  const [business, customization, allBusinesses] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId }, select: { name: true, logoUrl: true } }),
    prisma.businessCustomization.findUnique({
      where: { businessId },
      select: {
        primaryColorHsl: true, accentColorHsl: true, secondaryColorHsl: true,
        borderRadiusPreset: true, densityPreset: true, themeMode: true,
        dashboardBgType: true, dashboardBgValue: true, fontFamily: true,
      },
    }),
    getUserBusinesses(userId),
  ]);

  return (
    <ClerkProvider>
      {customization && <BusinessThemeInjector config={customization} />}
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-brand-mist/20">
        <Sidebar
          businessName={business?.name}
          logoUrl={business?.logoUrl}
          businesses={allBusinesses}
          currentBusinessId={businessId}
        />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </ClerkProvider>
  );
}
