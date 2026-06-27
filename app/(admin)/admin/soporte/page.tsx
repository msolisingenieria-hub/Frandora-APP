import { requireSuperAdmin } from "@/lib/auth/admin";
import { listTickets, getTicketStats } from "@/lib/services/admin-support.service";
import { SoporteClient } from "@/components/admin/SoporteClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Soporte · Frandora Admin" };

export default async function SoportePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireSuperAdmin();
  const { status } = await searchParams;
  const [tickets, stats] = await Promise.all([listTickets(status), getTicketStats()]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-navy">Sistema de Soporte</h1>
        <p className="mt-1 font-body text-sm text-slate-500">
          Gestiona los tickets de los negocios. Responde directamente desde aquí.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Abiertos", value: stats.open, color: "text-rose-600 bg-rose-50 border-rose-100" },
          { label: "En revisión", value: stats.inReview, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Resueltos", value: stats.resolved, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="font-sans text-2xl font-bold">{s.value}</p>
            <p className="font-body text-xs mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <SoporteClient tickets={tickets} currentStatus={status} />
    </div>
  );
}
