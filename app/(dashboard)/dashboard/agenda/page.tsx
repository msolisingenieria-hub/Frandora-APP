import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getAppointmentsForDashboard } from "@/lib/services/appointment.service";
import { getTimeBlocks } from "@/lib/services/time-block.service";
import { CalendarDays } from "lucide-react";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { AgendaView } from "@/components/dashboard/agenda/AgendaView";

export const metadata = { title: "Agenda | Frandora" };

export default async function AgendaPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      ownedBusinesses: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!user || user.ownedBusinesses.length === 0) redirect("/onboarding");

  const business = user.ownedBusinesses[0];
  const now  = new Date();
  const from = startOfMonth(now);
  const to   = endOfMonth(addMonths(now, 1));

  const [appointments, timeBlocks, staffMembers] = await Promise.all([
    getAppointmentsForDashboard(business.id, from, to),
    getTimeBlocks(business.id, from, to),
    prisma.staffMember.findMany({
      where: { businessId: business.id, isActive: true, acceptsBookings: true },
      select: {
        id: true, name: true, role: true, color: true, avatarUrl: true,
        schedules: { select: { dayOfWeek: true, isAvailable: true, startTime: true, endTime: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const todayCount    = appointments.filter((a) => new Date(a.startTime).toDateString() === new Date().toDateString()).length;
  const pendingCount  = appointments.filter((a) => a.status === "PENDING").length;

  return (
    <div className="flex flex-col h-screen overflow-hidden p-3 md:p-4"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 50%, #ffffff 100%)" }}>

      {/* Header compacto */}
      <div className="flex items-center gap-4 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-brand-teal flex-shrink-0" />
          <h1 className="text-brand-navy font-sans font-bold text-lg tracking-tight">Agenda</h1>
        </div>
        {/* Mini stats inline */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-body text-slate-500">
            <span className="font-sans font-bold text-brand-navy">{todayCount}</span> hoy
          </span>
          <span className="text-xs font-body text-slate-500">
            <span className="font-sans font-bold text-amber-500">{pendingCount}</span> pendientes
          </span>
        </div>
      </div>

      {/* Agenda ocupa el resto de la pantalla */}
      <div className="flex-1 min-h-0">
        <AgendaView
          appointments={appointments}
          timeBlocks={timeBlocks}
          businessSlug={business.slug}
          staff={staffMembers}
        />
      </div>
    </div>
  );
}
