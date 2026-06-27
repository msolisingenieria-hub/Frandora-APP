"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Plus, Users } from "lucide-react";
import { MembershipList } from "@/components/dashboard/memberships/MembershipList";
import { MembershipForm } from "@/components/dashboard/memberships/MembershipForm";
import { MembershipStatsBar } from "@/components/dashboard/memberships/MembershipStatsBar";
import { SubscribersPanel } from "@/components/dashboard/memberships/SubscribersPanel";
import { AssignMembershipModal } from "@/components/dashboard/memberships/AssignMembershipModal";
import type { MembershipItem, CreateMembershipInput } from "@/types/membership";

type Stats = {
  mrr: number; arr: number;
  activeSubscribers: number; pausedSubscribers: number; expiredSubscribers: number;
  totalPlans: number; activePlans: number;
};

export default function MembresiasPage() {
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [tab, setTab] = useState<"planes" | "suscriptores">("planes");

  const load = useCallback(async () => {
    const [mbRes, stRes] = await Promise.all([
      fetch("/api/memberships"),
      fetch("/api/memberships/stats"),
    ]);
    setMemberships(await mbRes.json());
    setStats(await stRes.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(data: CreateMembershipInput) {
    await fetch("/api/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowCreate(false);
    load();
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={22} className="text-[#6FA89E]" />
          <h1 className="text-xl md:text-2xl font-bold text-[#0D1B2A]">Membresías</h1>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#0D1B2A] text-white hover:bg-[#1a2f45]">
          <Plus size={16} className="mr-1" /> Nuevo plan
        </Button>
      </div>

      {stats && (
        <MembershipStatsBar
          mrr={stats.mrr}
          arr={stats.arr}
          activeSubscribers={stats.activeSubscribers}
          pausedSubscribers={stats.pausedSubscribers}
          expiredSubscribers={stats.expiredSubscribers}
        />
      )}

      <div className="flex gap-2 border-b border-gray-100">
        {(["planes", "suscriptores"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? "border-[#0D1B2A] text-[#0D1B2A]" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t === "planes" ? "Planes" : "Suscriptores"}
          </button>
        ))}
      </div>

      {tab === "planes" && (
        <MembershipList memberships={memberships} onRefresh={load} />
      )}

      {tab === "suscriptores" && (
        <div className="space-y-4">
          {memberships.length === 0 ? (
            <p className="text-sm text-gray-400">Crea un plan primero.</p>
          ) : (
            memberships.map((m: MembershipItem) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                    <span className="font-medium text-[#0D1B2A]">{m.name}</span>
                    <span className="text-xs text-gray-400">{m.subscriberCount} activos</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setShowAssign(m.id)}
                  >
                    <Users size={12} className="mr-1" />
                    Asignar
                  </Button>
                </div>
                <div className="p-4">
                  <SubscribersPanel membershipId={m.id} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={(o: boolean) => !o && setShowCreate(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Crear plan de membresía</DialogTitle></DialogHeader>
          <MembershipForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>

      {showAssign && (
        <AssignMembershipModal
          membershipId={showAssign}
          open={!!showAssign}
          onClose={() => setShowAssign(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
