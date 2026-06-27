"use client";

import { useState } from "react";
import { Plus, Flag, Users, BarChart2, Layers, Trash2 } from "lucide-react";
import { FeatureFlagToggle } from "@/components/admin/FeatureFlagToggle";
import { NewFeatureFlagForm } from "@/components/admin/NewFeatureFlagForm";
import { useRouter } from "next/navigation";
import type { FeatureFlag } from "@prisma/client";

interface FlagWithCount extends FeatureFlag {
  _count: { overrides: number };
}

const SCOPE_ICONS = {
  ALL: <Users size={13} />,
  PLAN: <Layers size={13} />,
  BUSINESS: <BarChart2 size={13} />,
};

const SCOPE_LABELS = {
  ALL: "Todos",
  PLAN: "Por plan",
  BUSINESS: "Por negocio",
};

export function FeatureFlagsClient({ flags }: { flags: FlagWithCount[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteFlag(id: string) {
    if (!confirm("¿Eliminar este feature flag? Esta acción no se puede deshacer.")) return;
    setDeleting(id);
    await fetch(`/api/admin/feature-flags/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <p className="font-body text-sm text-slate-500">
          {flags.length} flag{flags.length !== 1 ? "s" : ""} configurado{flags.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-sm font-sans font-semibold text-white hover:bg-navy/90 transition-colors"
        >
          <Plus size={15} /> Nuevo flag
        </button>
      </div>

      {/* Empty state */}
      {flags.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Flag size={32} className="mb-3 text-slate-300" />
          <p className="font-sans font-semibold text-slate-600">Sin feature flags aún</p>
          <p className="mt-1 font-body text-sm text-slate-400">Crea el primero para activar funciones sin redeploy.</p>
        </div>
      )}

      {/* Flags list */}
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className={`rounded-xl border p-5 transition-opacity ${flag.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-sm font-semibold text-navy">{flag.name}</code>
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-body text-slate-500">
                    {SCOPE_ICONS[flag.scope]}
                    {SCOPE_LABELS[flag.scope]}
                  </span>
                  {flag.enabledForAll && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-body font-medium text-emerald-700">
                      Activo para todos
                    </span>
                  )}
                  {!flag.enabledForAll && flag.rolloutPercent > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-body font-medium text-amber-700">
                      {flag.rolloutPercent}% rollout
                    </span>
                  )}
                </div>
                {flag.description && (
                  <p className="mt-1 font-body text-sm text-slate-500">{flag.description}</p>
                )}
                {flag.enabledPlans.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {flag.enabledPlans.map((plan) => (
                      <span key={plan} className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-body font-medium text-navy">
                        {plan.charAt(0) + plan.slice(1).toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
                {flag._count.overrides > 0 && (
                  <p className="mt-1.5 font-body text-xs text-slate-400">
                    {flag._count.overrides} override{flag._count.overrides !== 1 ? "s" : ""} por negocio
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Activo/Inactivo */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-body text-slate-400">Activo</span>
                  <FeatureFlagToggle flagId={flag.id} field="isActive" value={flag.isActive} label="Toggle activo" />
                </div>
                {/* Habilitado para todos */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-body text-slate-400">Para todos</span>
                  <FeatureFlagToggle flagId={flag.id} field="enabledForAll" value={flag.enabledForAll} label="Toggle habilitado" />
                </div>
                <button
                  onClick={() => deleteFlag(flag.id)}
                  disabled={deleting === flag.id}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && <NewFeatureFlagForm onClose={() => setShowForm(false)} />}
    </>
  );
}
