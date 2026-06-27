import { TrendingUp, DollarSign, Users, TrendingDown, Building2, LineChart } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { PlanBreakdownTable } from "@/components/admin/PlanBreakdownTable";
import { getAdminFinancials } from "@/lib/services/admin-metrics.service";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminFinancialsPage() {
  const f = await getAdminFinancials();
  const churnPct = (f.churnRate * 100).toFixed(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      {/* ── Encabezado ── */}
      <header className="mb-7">
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal">
          Panel de control
        </p>
        <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-brand-navy md:text-3xl">
          Salud financiera de Frandora
        </h1>
        <p className="mt-1 text-sm font-body text-slate-500">
          Ingresos recurrentes, crecimiento y retención de la plataforma en tiempo real.
        </p>
      </header>

      {/* ── KPIs principales ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Ingreso mensual (MRR)"
          value={formatCurrency(f.mrr)}
          hint="Suscripciones activas normalizadas"
          icon={DollarSign}
          tone="teal"
        />
        <MetricCard
          label="Ingreso anual (ARR)"
          value={formatCurrency(f.arr)}
          hint="MRR proyectado a 12 meses"
          icon={TrendingUp}
          tone="navy"
        />
        <MetricCard
          label="Negocios activos"
          value={String(f.activeSubscribers)}
          hint={`${f.trialingCount} en prueba · ${f.pastDueCount} con pago pendiente`}
          icon={Users}
          tone="navy"
        />
        <MetricCard
          label="Cancelación mensual"
          value={`${churnPct}%`}
          hint="Negocios que cancelaron este mes"
          icon={TrendingDown}
          tone={f.churnRate > 0.05 ? "rose" : "teal"}
        />
      </section>

      {/* ── KPIs secundarios ── */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Nuevos negocios (mes)"
          value={String(f.newBusinesses.month)}
          hint={`${f.newBusinesses.today} hoy · ${f.newBusinesses.week} esta semana`}
          icon={Building2}
          tone="teal"
        />
        <MetricCard
          label="LTV promedio"
          value={formatCurrency(Math.round(f.averageLtv))}
          hint="Valor de vida estimado por negocio"
          icon={Users}
          tone="navy"
        />
        <MetricCard
          label="Proyección próximo mes"
          value={formatCurrency(Math.round(f.projectedNextMonth))}
          hint="MRR retenido tras cancelaciones"
          icon={LineChart}
          tone="navy"
        />
      </section>

      {/* ── Desglose por plan ── */}
      <section className="mt-7">
        <PlanBreakdownTable rows={f.planBreakdown} />
      </section>
    </div>
  );
}
