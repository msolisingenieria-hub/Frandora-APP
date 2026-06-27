import { Building2, Users, CalendarDays, Search } from "lucide-react";
import { listBusinesses } from "@/lib/services/admin-businesses.service";
import { BusinessStatusBadge } from "@/components/admin/BusinessStatusBadge";
import { BusinessActionsMenu } from "@/components/admin/BusinessActionsMenu";
import { formatDate } from "@/lib/utils";
import type { BusinessStatus, PlanTier } from "@prisma/client";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, string> = {
  STARTER: "Starter", PROFESSIONAL: "Professional",
  BUSINESS: "Business", SCALE: "Scale", ENTERPRISE: "Enterprise",
};

interface PageProps {
  searchParams: {
    search?: string; status?: string; plan?: string;
    page?: string; sort?: string; dir?: string;
  };
}

export default async function AdminNegociosPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;

  const { items, total } = await listBusinesses({
    search:  searchParams.search,
    status:  searchParams.status as BusinessStatus | undefined,
    plan:    searchParams.plan   as PlanTier | undefined,
    page,
    perPage: 25,
    sort:    (searchParams.sort as "name" | "createdAt" | "status") ?? "createdAt",
    dir:     (searchParams.dir  as "asc" | "desc")                  ?? "desc",
  });

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      {/* ── Encabezado ── */}
      <header className="mb-7">
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal">
          Super Admin
        </p>
        <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-brand-navy md:text-3xl">
          Negocios registrados
        </h1>
        <p className="mt-1 text-sm font-body text-slate-500">
          {total} negocio{total !== 1 ? "s" : ""} en total
        </p>
      </header>

      {/* ── Filtros ── */}
      <form method="GET" className="mb-5 flex flex-wrap gap-3">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="Buscar por nombre, URL o correo..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm font-body text-slate-800 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-[border-color,box-shadow]"
          />
        </div>

        {/* Filtro estado */}
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-body text-slate-700 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="SUSPENDED">Suspendidos</option>
          <option value="CANCELED">Cancelados</option>
        </select>

        {/* Filtro plan */}
        <select
          name="plan"
          defaultValue={searchParams.plan ?? ""}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-body text-slate-700 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        >
          <option value="">Todos los planes</option>
          <option value="STARTER">Starter</option>
          <option value="PROFESSIONAL">Professional</option>
          <option value="BUSINESS">Business</option>
          <option value="SCALE">Scale</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>

        <button
          type="submit"
          className="rounded-xl px-5 py-2.5 text-sm font-sans font-semibold text-white transition-[opacity,transform] active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
        >
          Buscar
        </button>
      </form>

      {/* ── Tabla ── */}
      <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Building2 size={40} className="text-slate-200" />
            <p className="text-sm font-body text-slate-400">No se encontraron negocios.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] font-sans font-semibold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-5 py-3">Negocio</th>
                  <th className="px-5 py-3">Propietario</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-center">Clientes</th>
                  <th className="px-5 py-3 text-center">Citas</th>
                  <th className="px-5 py-3">Registro</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body">
                {items.map((biz) => (
                  <tr key={biz.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-sans font-medium text-brand-navy">{biz.name}</p>
                      <p className="text-[11px] text-slate-400">{biz.slug}.frandora.cl</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700">{biz.owner.name}</p>
                      <p className="text-[11px] text-slate-400">{biz.owner.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-brand-navy/5 px-2.5 py-0.5 text-[11px] font-sans font-semibold text-brand-navy">
                        {biz.subscription ? PLAN_LABELS[biz.subscription.plan.tier] : "Sin plan"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <BusinessStatusBadge status={biz.status} />
                    </td>
                    <td className="px-5 py-3.5 text-center tabular-nums text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} className="text-slate-400" />
                        {biz._count.clients}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center tabular-nums text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={12} className="text-slate-400" />
                        {biz._count.appointments}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 tabular-nums">
                      {formatDate(biz.createdAt)}
                    </td>
                    <td className="px-3 py-3.5">
                      <BusinessActionsMenu
                        businessId={biz.id}
                        businessName={biz.name}
                        currentStatus={biz.status}
                        currentPlan={biz.subscription?.plan.tier ?? ""}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Paginación ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs font-body text-slate-400">
              Página {page} de {totalPages} · {total} negocios
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-sans font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Anterior
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-sans font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Siguiente
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
