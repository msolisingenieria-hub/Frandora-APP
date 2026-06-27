"use client";

import { TrendingUp, Users, Pause, XCircle } from "lucide-react";

type Props = {
  mrr: number;
  arr: number;
  activeSubscribers: number;
  pausedSubscribers: number;
  expiredSubscribers: number;
};

function fmt(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export function MembershipStatsBar({ mrr, arr, activeSubscribers, pausedSubscribers, expiredSubscribers }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <TrendingUp size={14} className="text-[#6FA89E]" />
          MRR
        </div>
        <p className="text-xl font-bold text-[#0D1B2A]">{fmt(mrr)}</p>
        <p className="text-xs text-gray-400">ARR {fmt(arr)}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Users size={14} className="text-green-500" />
          Activos
        </div>
        <p className="text-xl font-bold text-[#0D1B2A]">{activeSubscribers}</p>
        <p className="text-xs text-gray-400">suscriptores</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Pause size={14} className="text-yellow-500" />
          Pausados
        </div>
        <p className="text-xl font-bold text-[#0D1B2A]">{pausedSubscribers}</p>
        <p className="text-xs text-gray-400">suscriptores</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <XCircle size={14} className="text-red-400" />
          Vencidos
        </div>
        <p className="text-xl font-bold text-[#0D1B2A]">{expiredSubscribers}</p>
        <p className="text-xs text-gray-400">suscriptores</p>
      </div>
    </div>
  );
}
