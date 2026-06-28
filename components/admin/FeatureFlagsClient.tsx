"use client";

import { useState } from "react";
import { Plus, Flag, Users, BarChart2, Layers, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { FeatureFlagToggle } from "@/components/admin/FeatureFlagToggle";
import { NewFeatureFlagForm } from "@/components/admin/NewFeatureFlagForm";
import { useRouter } from "next/navigation";
import type { FeatureFlag } from "@prisma/client";

interface FlagWithCount extends FeatureFlag {
  _count: { overrides: number };
}

type Scope = "ALL" | "PLAN" | "BUSINESS";

const SCOPE_META: Record<Scope, { icon: React.ReactNode; label: string; eyebrow: string }> = {
  ALL: {
    icon: <Users size={13} />,
    label: "Para todos",
    eyebrow: "Alcance global",
  },
  PLAN: {
    icon: <Layers size={13} />,
    label: "Por plan",
    eyebrow: "Segmentado por suscripción",
  },
  BUSINESS: {
    icon: <BarChart2 size={13} />,
    label: "Por negocio",
    eyebrow: "Override individual",
  },
};

const SCOPE_ORDER: Scope[] = ["ALL", "PLAN", "BUSINESS"];

function RolloutBar({ percent }: { percent: number }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] font-body text-slate-400 uppercase tracking-wide">Rollout</span>
        <span className="text-[10px] font-mono font-semibold text-brand-teal">{percent}%</span>
      </div>
      <div className="h-1 bg-brand-teal/20 rounded-full overflow-hidden">
        <div
          className="h-1 bg-brand-teal rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function FlagCard({
  flag,
  onDelete,
  deleting,
}: {
  flag: FlagWithCount;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        flag.isActive
          ? "border-slate-200 bg-white shadow-brand-sm"
          : "border-slate-100 bg-slate-50/60 opacity-60"
      }`}
    >
      <div className="p-4 md:p-5">
        {/* Top row: toggles + delete */}
        <div className="flex items-start gap-3 justify-between">
          {/* Primary toggle + name */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="pt-0.5">
              <FeatureFlagToggle
                flagId={flag.id}
                field="isActive"
                value={flag.isActive}
                label="Activar / desactivar flag"
              />
            </div>
            <div className="min-w-0 flex-1">
              <code className="inline-block font-mono bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-xs break-all leading-5">
                {flag.name}
              </code>
              {flag.description && (
                <p className="mt-1 font-body text-sm text-slate-500 leading-snug">
                  {flag.description}
                </p>
              )}
            </div>
          </div>

          {/* Secondary toggle: Para todos + delete */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-center gap-0.5">
              <FeatureFlagToggle
                flagId={flag.id}
                field="enabledForAll"
                value={flag.enabledForAll}
                label="Habilitar para todos"
              />
              <span className="text-[9px] font-body text-slate-400 text-center leading-tight">
                Para<br />todos
              </span>
            </div>
            <button
              onClick={() => onDelete(flag.id)}
              disabled={deleting}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              aria-label="Eliminar flag"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Status pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {flag.enabledForAll && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-body font-medium text-emerald-700">
              Activo para todos
            </span>
          )}
          {!flag.enabledForAll && flag.rolloutPercent > 0 && flag.rolloutPercent < 100 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-body font-medium text-amber-700">
              Rollout parcial
            </span>
          )}
          {flag.enabledPlans.length > 0 &&
            flag.enabledPlans.map((plan) => (
              <span
                key={plan}
                className="rounded-full bg-brand-navy/10 px-2 py-0.5 text-[11px] font-body font-medium text-brand-navy"
              >
                {plan.charAt(0) + plan.slice(1).toLowerCase()}
              </span>
            ))}
          {flag._count.overrides > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-body text-slate-500">
              {flag._count.overrides} override{flag._count.overrides !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Rollout bar (only when relevant) */}
        {!flag.enabledForAll && flag.rolloutPercent > 0 && (
          <RolloutBar percent={flag.rolloutPercent} />
        )}
      </div>
    </div>
  );
}

function ScopeSection({
  scope,
  flags,
  onDelete,
  deleting,
}: {
  scope: Scope;
  flags: FlagWithCount[];
  onDelete: (id: string) => void;
  deleting: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = SCOPE_META[scope];

  return (
    <div className="mb-8">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between gap-3 mb-3 group"
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-brand-teal/10 text-brand-teal">
            {meta.icon}
          </span>
          <div className="text-left">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal leading-none mb-0.5">
              {meta.eyebrow}
            </p>
            <p className="font-sans font-semibold text-brand-navy text-sm">
              {meta.label}
              <span className="ml-2 text-xs font-body font-normal text-slate-400">
                ({flags.length})
              </span>
            </p>
          </div>
        </div>
        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
          {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </span>
      </button>

      <div className={`border-t border-slate-100 mb-4`} />

      {!collapsed && (
        <div className="space-y-3">
          {flags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onDelete={onDelete}
              deleting={deleting === flag.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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

  const flagsByScope = SCOPE_ORDER.reduce<Record<Scope, FlagWithCount[]>>(
    (acc, scope) => {
      acc[scope] = flags.filter((f) => f.scope === scope);
      return acc;
    },
    { ALL: [], PLAN: [], BUSINESS: [] }
  );

  const activeCount = flags.filter((f) => f.isActive).length;

  return (
    <>
      {/* Header bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal">
            Operación
          </p>
          <p className="font-body text-sm text-slate-500 mt-0.5">
            {flags.length} flag{flags.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-emerald-600 font-medium">{activeCount} activo{activeCount !== 1 ? "s" : ""}</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-sans font-semibold text-white hover:bg-brand-navy/90 transition-colors self-start sm:self-auto"
        >
          <Plus size={15} /> Nuevo flag
        </button>
      </div>

      {/* Empty state */}
      {flags.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 md:p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Flag size={24} className="text-slate-300" />
          </div>
          <p className="font-sans font-semibold text-slate-600">Sin feature flags aún</p>
          <p className="mt-1 font-body text-sm text-slate-400 max-w-xs">
            Crea el primero para activar funciones en producción sin necesidad de publicar cambios.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-sans font-semibold text-white hover:bg-brand-navy/90 transition-colors"
          >
            <Plus size={14} /> Crear primer flag
          </button>
        </div>
      )}

      {/* Flags grouped by scope */}
      {flags.length > 0 && (
        <div>
          {SCOPE_ORDER.map((scope) =>
            flagsByScope[scope].length > 0 ? (
              <ScopeSection
                key={scope}
                scope={scope}
                flags={flagsByScope[scope]}
                onDelete={deleteFlag}
                deleting={deleting}
              />
            ) : null
          )}
        </div>
      )}

      {showForm && <NewFeatureFlagForm onClose={() => setShowForm(false)} />}
    </>
  );
}
