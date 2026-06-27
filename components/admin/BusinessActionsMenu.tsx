"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal, Ban, CheckCircle, ArrowUpCircle,
  ExternalLink, Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BusinessStatus } from "@prisma/client";

interface Props {
  businessId: string;
  businessName: string;
  currentStatus: BusinessStatus;
  currentPlan: string;
}

const PLAN_OPTIONS = ["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE", "ENTERPRISE"] as const;

export function BusinessActionsMenu({ businessId, businessName, currentStatus, currentPlan }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function post(url: string, body: Record<string, unknown>, label: string) {
    setLoading(label);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("No se pudo completar la acción. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  async function handleImpersonate() {
    setLoading("impersonate");
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/impersonate`, { method: "POST" });
      const data = await res.json() as { businessId: string };
      // Abre el panel del negocio con cookie temporal en nueva pestaña
      document.cookie = `x-admin-impersonate=${data.businessId}; path=/; max-age=3600`;
      window.open("/dashboard", "_blank");
    } catch {
      alert("No se pudo iniciar la vista del negocio.");
    } finally {
      setLoading(null);
    }
  }

  const isSuspended = currentStatus === "SUSPENDED";
  const busy = loading !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          disabled={busy}
          aria-label={`Acciones para ${businessName}`}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <MoreHorizontal size={15} />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {/* Ver panel (impersonar — solo lectura) */}
        <DropdownMenuItem onClick={handleImpersonate} className="gap-2 text-sm">
          <ExternalLink size={14} /> Ver panel del negocio
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Suspender / Reactivar */}
        {isSuspended ? (
          <DropdownMenuItem
            onClick={() => post(`/api/admin/businesses/${businessId}/status`, { action: "reactivate" }, "status")}
            className="gap-2 text-sm text-emerald-700"
          >
            <CheckCircle size={14} /> Reactivar negocio
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              if (confirm(`¿Suspender "${businessName}"? El negocio no podrá operar.`)) {
                post(`/api/admin/businesses/${businessId}/status`, { action: "suspend" }, "status");
              }
            }}
            className="gap-2 text-sm text-amber-700"
          >
            <Ban size={14} /> Suspender negocio
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Cambiar plan */}
        {PLAN_OPTIONS.filter((p) => p !== currentPlan).map((tier) => (
          <DropdownMenuItem
            key={tier}
            onClick={() => post(`/api/admin/businesses/${businessId}/plan`, { tier }, "plan")}
            className="gap-2 text-sm"
          >
            <ArrowUpCircle size={14} />
            Cambiar a {tier.charAt(0) + tier.slice(1).toLowerCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
