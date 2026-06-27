"use client";

import type { PortalAppointment } from "@/types/client-portal";

type Props = { appointments: PortalAppointment[] };

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió",
};

export function PortalHistory({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No hay citas en tu historial.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map((apt) => {
        const start = new Date(apt.startTime);
        return (
          <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100">
            <div>
              <p className="text-sm font-medium text-[#0D1B2A]">{apt.serviceName}</p>
              <p className="text-xs text-gray-400">
                {start.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                {apt.staffName ? ` · ${apt.staffName}` : ""}
              </p>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                apt.status === "COMPLETED" ? "bg-green-50 text-green-600" :
                apt.status === "CANCELLED" ? "bg-red-50 text-red-500" :
                "bg-gray-100 text-gray-500"
              }`}>
                {STATUS_LABELS[apt.status] ?? apt.status}
              </span>
              {apt.price > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {apt.price.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
