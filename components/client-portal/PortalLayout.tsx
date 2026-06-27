"use client";

import { useState } from "react";
import { CalendarDays, History, CreditCard, Package, Star } from "lucide-react";
import type { PortalData } from "@/types/client-portal";
import { PortalUpcoming } from "./PortalUpcoming";
import { PortalHistory } from "./PortalHistory";
import { PortalMembershipCard } from "./PortalMembershipCard";
import { PortalPackagesCard } from "./PortalPackagesCard";

type Props = {
  data: PortalData;
  token: string;
};

type Tab = "citas" | "historial" | "membresia" | "paquetes" | "puntos";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "citas",     label: "Próximas",  icon: CalendarDays },
  { id: "historial", label: "Historial", icon: History },
  { id: "membresia", label: "Membresía", icon: CreditCard },
  { id: "paquetes",  label: "Paquetes",  icon: Package },
  { id: "puntos",    label: "Puntos",    icon: Star },
];

export function PortalLayout({ data, token }: Props) {
  const [tab, setTab] = useState<Tab>("citas");
  const [portalData, setPortalData] = useState(data);

  async function reload() {
    const res = await fetch(`/api/portal/${token}`);
    if (res.ok) setPortalData(await res.json());
  }

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <div className="bg-[#0D1B2A] text-white px-4 pt-10 pb-6">
        <div className="max-w-md mx-auto">
          {portalData.business.logoUrl ? (
            <img src={portalData.business.logoUrl} alt={portalData.business.name} className="h-8 mb-4 object-contain" />
          ) : (
            <p className="text-[#6FA89E] text-sm font-medium mb-1">{portalData.business.name}</p>
          )}
          <div className="flex items-center gap-3">
            {portalData.client.avatarUrl ? (
              <img src={portalData.client.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#6FA89E]/20 flex items-center justify-center text-[#6FA89E] font-bold text-lg">
                {portalData.client.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg">¡Hola, {portalData.client.name.split(" ")[0]}!</h1>
              {portalData.client.email && <p className="text-white/60 text-sm">{portalData.client.email}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-3 -mx-4 px-4 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                tab === t.id
                  ? "bg-[#0D1B2A] text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="pb-8">
          {tab === "citas" && (
            <PortalUpcoming
              appointments={portalData.upcomingAppointments}
              token={token}
              onCancelled={reload}
            />
          )}
          {tab === "historial" && <PortalHistory appointments={portalData.pastAppointments} />}
          {tab === "membresia" && (
            portalData.activeMembership
              ? <PortalMembershipCard membership={portalData.activeMembership} />
              : <div className="text-center py-8 text-gray-400 text-sm">No tienes una membresía activa.</div>
          )}
          {tab === "paquetes" && <PortalPackagesCard packages={portalData.activePackages} />}
          {tab === "puntos" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
              <Star size={32} className="text-[#6FA89E] mx-auto mb-2" />
              <p className="text-3xl font-bold text-[#0D1B2A]">{portalData.client.loyaltyPoints}</p>
              <p className="text-gray-500 text-sm mt-1">puntos acumulados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
