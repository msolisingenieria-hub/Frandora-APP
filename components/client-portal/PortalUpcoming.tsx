"use client";

import { useState } from "react";
import type { PortalAppointment } from "@/types/client-portal";

type Props = {
  appointments: PortalAppointment[];
  token: string;
  onCancelled: () => void;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELED: "Cancelada",
  COMPLETED: "Completada",
  NO_SHOW: "No asistió",
  IN_PROGRESS: "En curso",
};

export function PortalUpcoming({ appointments, token, onCancelled }: Props) {
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function handleCancel(appointmentId: string) {
    if (!confirm("¿Cancelar esta cita?")) return;
    setCancelling(appointmentId);
    try {
      const res = await fetch(`/api/portal/${token}/cancel/${appointmentId}`, { method: "POST" });
      if (res.ok) onCancelled();
    } finally {
      setCancelling(null);
    }
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">No tienes citas próximas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => {
        const start = new Date(apt.startTime);
        return (
          <div key={apt.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#0D1B2A] truncate">{apt.serviceName}</p>
                {apt.staffName && <p className="text-xs text-gray-400 mt-0.5">con {apt.staffName}</p>}
                <p className="text-sm text-gray-600 mt-1">
                  {start.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <p className="text-sm text-gray-600">
                  {start.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right ml-4 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  apt.status === "CONFIRMED" ? "bg-green-50 text-green-700" :
                  apt.status === "PENDING" ? "bg-yellow-50 text-yellow-700" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {STATUS_LABELS[apt.status] ?? apt.status}
                </span>
                {apt.price > 0 && (
                  <p className="text-sm font-semibold text-[#0D1B2A] mt-1">
                    {apt.price.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
                  </p>
                )}
              </div>
            </div>
            {apt.canCancel && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <button
                  onClick={() => handleCancel(apt.id)}
                  disabled={cancelling === apt.id}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  {cancelling === apt.id ? "Cancelando..." : "Cancelar cita"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
