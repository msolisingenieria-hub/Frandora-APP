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

  const [appointments, timeBlocks] = await Promise.all([
    getAppointmentsForDashboard(business.id, from, to),
    getTimeBlocks(business.id, from, to),
  ]);

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <CalendarDays size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">
              Agenda
            </p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
            Calendario y citas
          </h1>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Hoy",
            value: appointments.filter((a) => {
              const d = new Date(a.startTime);
              return d.toDateString() === new Date().toDateString();
            }).length,
          },
          {
            label: "Esta semana",
            value: appointments.filter((a) => {
              const d = new Date(a.startTime);
              const n = new Date();
              const ws = new Date(n); ws.setDate(n.getDate() - n.getDay() + 1);
              const we = new Date(ws); we.setDate(ws.getDate() + 7);
              return d >= ws && d < we;
            }).length,
          },
          { label: "Pendientes",  value: appointments.filter(a => a.status === "PENDING").length },
          { label: "Completadas", value: appointments.filter(a => a.status === "COMPLETED").length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-brand-sm p-4">
            <p className="text-brand-navy font-sans font-bold text-2xl">{stat.value}</p>
            <p className="text-slate-400 text-xs mt-0.5 font-body">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Vista interactiva con tabs — componente cliente */}
      <AgendaView
        appointments={appointments}
        timeBlocks={timeBlocks}
        businessSlug={business.slug}
      />
    </div>
  );
}
