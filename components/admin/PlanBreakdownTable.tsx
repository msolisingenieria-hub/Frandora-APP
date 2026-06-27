import { formatCurrency } from "@/lib/utils";
import type { PlanBreakdown } from "@/lib/services/admin-metrics.service";

export function PlanBreakdownTable({ rows }: { rows: PlanBreakdown[] }) {
  const totalMrr = rows.reduce((s, r) => s + r.mrr, 0);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-sans text-sm font-semibold text-brand-navy">Ingresos por plan</h2>
        <p className="text-xs font-body text-slate-400">Suscripciones activas y valor de cada plan</p>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm font-body text-slate-400">
          Aún no hay suscripciones activas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-sans font-semibold uppercase tracking-[0.1em] text-slate-400">
                <th className="px-5 py-2.5">Plan</th>
                <th className="px-5 py-2.5 text-right">Activos</th>
                <th className="px-5 py-2.5 text-right">Ingreso mensual</th>
                <th className="px-5 py-2.5 text-right">LTV estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-body">
              {rows.map((r) => (
                <tr key={r.tier} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <span className="font-sans font-medium text-brand-navy">{r.name}</span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-600">{r.activeCount}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium text-brand-navy">
                    {formatCurrency(r.mrr)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-600">
                    {formatCurrency(Math.round(r.ltv))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50/40 font-sans font-semibold">
                <td className="px-5 py-3 text-brand-navy">Total</td>
                <td className="px-5 py-3 text-right tabular-nums text-brand-navy">
                  {rows.reduce((s, r) => s + r.activeCount, 0)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-brand-teal">{formatCurrency(totalMrr)}</td>
                <td className="px-5 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
