"use client";

import type { PortalPackage } from "@/types/client-portal";

type Props = { packages: PortalPackage[] };

export function PortalPackagesCard({ packages }: Props) {
  if (packages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No tienes paquetes activos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {packages.map((pkg) => {
        const pct = Math.max(0, Math.min(100, (pkg.sessionsRemaining / pkg.sessionsTotal) * 100));
        return (
          <div key={pkg.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-[#0D1B2A]">{pkg.packageName}</h4>
                {pkg.expiresAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Vence: {new Date(pkg.expiresAt).toLocaleDateString("es-CL")}
                  </p>
                )}
              </div>
              <span className="text-[#0D1B2A] font-bold text-lg">{pkg.sessionsRemaining}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Sesiones disponibles</span>
              <span>{pkg.sessionsUsed} usadas de {pkg.sessionsTotal}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6FA89E] rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
