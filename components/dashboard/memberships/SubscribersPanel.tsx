"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Pause, CheckCircle, XCircle } from "lucide-react";
import type { ClientMembershipItem, ClientMembershipStatus } from "@/types/membership";
import { MEMBERSHIP_STATUS_LABELS } from "@/types/membership";

type Props = {
  membershipId: string;
};

const STATUS_COLORS: Record<ClientMembershipStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-600",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export function SubscribersPanel({ membershipId }: Props) {
  const [subscribers, setSubscribers] = useState<ClientMembershipItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/memberships/${membershipId}/subscribers`);
    const data = await res.json();
    setSubscribers(data);
    setLoading(false);
  }, [membershipId]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(subId: string, status: ClientMembershipStatus) {
    await fetch(`/api/memberships/${membershipId}/subscribers/${subId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) return <p className="text-sm text-gray-400 py-4">Cargando suscriptores...</p>;
  if (subscribers.length === 0) return <p className="text-sm text-gray-400 py-4">Sin suscriptores.</p>;

  return (
    <div className="space-y-2">
      {subscribers.map((s: ClientMembershipItem) => (
        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
          <div>
            <p className="text-sm font-medium text-[#0D1B2A]">{s.clientName}</p>
            <p className="text-xs text-gray-400">{s.clientEmail}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Vence: {new Date(s.endDate).toLocaleDateString("es-CL")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>
              {MEMBERSHIP_STATUS_LABELS[s.status]}
            </span>
            {s.status === "ACTIVE" && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateStatus(s.id, "PAUSED")}>
                <Pause size={12} />
              </Button>
            )}
            {s.status === "PAUSED" && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateStatus(s.id, "ACTIVE")}>
                <CheckCircle size={12} />
              </Button>
            )}
            {s.status !== "CANCELLED" && s.status !== "EXPIRED" && (
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => updateStatus(s.id, "CANCELLED")}>
                <XCircle size={12} />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
