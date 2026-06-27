"use client";

import type { PortalMembership } from "@/types/client-portal";

type Props = { membership: PortalMembership };

const CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  ANNUAL: "Anual",
};

export function PortalMembershipCard({ membership }: Props) {
  const endDate = new Date(membership.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));

  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a3050] text-white rounded-2xl p-5 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-[#6FA89E] font-medium uppercase tracking-wider">Tu membresía</p>
          <h3 className="text-xl font-bold mt-1">{membership.membershipName}</h3>
          <p className="text-sm text-white/60">{CYCLE_LABELS[membership.billingCycle] ?? membership.billingCycle}</p>
        </div>
        <span className="bg-[#6FA89E]/20 text-[#6FA89E] text-xs font-medium px-2 py-1 rounded-full">
          {membership.status === "ACTIVE" ? "Activa" : membership.status}
        </span>
      </div>

      {membership.sessionsPerCycle && membership.sessionsPerCycle > 0 ? (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/70">Sesiones usadas</span>
            <span>{membership.sessionsUsed} / {membership.sessionsPerCycle}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6FA89E] rounded-full transition-all"
              style={{ width: `${Math.min(100, (membership.sessionsUsed / membership.sessionsPerCycle) * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {membership.discountPercent > 0 && (
        <div className="bg-white/10 rounded-lg px-3 py-2 mb-4">
          <p className="text-sm font-medium">{membership.discountPercent}% de descuento en todos tus servicios</p>
        </div>
      )}

      <div className="flex justify-between text-xs text-white/50">
        <span>Vence: {endDate.toLocaleDateString("es-CL")}</span>
        <span>{daysLeft > 0 ? `${daysLeft} días restantes` : "Vencida"}</span>
      </div>
    </div>
  );
}
