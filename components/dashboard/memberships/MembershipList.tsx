"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Trash2, Users } from "lucide-react";
import { MembershipForm } from "./MembershipForm";
import type { MembershipItem, CreateMembershipInput } from "@/types/membership";
import { BILLING_CYCLE_LABELS } from "@/types/membership";

type Props = {
  memberships: MembershipItem[];
  onRefresh: () => void;
};

function fmt(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export function MembershipList({ memberships, onRefresh }: Props) {
  const [editing, setEditing] = useState<MembershipItem | null>(null);

  async function handleUpdate(data: CreateMembershipInput) {
    if (!editing) return;
    await fetch(`/api/memberships/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este plan de membresía?")) return;
    await fetch(`/api/memberships/${id}`, { method: "DELETE" });
    onRefresh();
  }

  async function handleToggle(m: MembershipItem) {
    await fetch(`/api/memberships/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive }),
    });
    onRefresh();
  }

  if (memberships.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No hay planes creados aún.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {memberships.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            style={{ borderTop: `4px solid ${m.color}` }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#0D1B2A]">{m.name}</h3>
                  <p className="text-xs text-gray-400">{BILLING_CYCLE_LABELS[m.billingCycle]}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(m)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {m.description && <p className="text-xs text-gray-500 mb-3">{m.description}</p>}
              <p className="text-2xl font-bold text-[#0D1B2A]">{fmt(m.price)}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {m.sessionsPerCycle && m.sessionsPerCycle > 0 ? (
                  <Badge variant="outline" className="text-xs">{m.sessionsPerCycle} sesiones/ciclo</Badge>
                ) : null}
                {m.discountPercent > 0 && (
                  <Badge variant="outline" className="text-xs">{m.discountPercent}% descuento</Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users size={12} />
                  {m.subscriberCount} suscriptor{m.subscriberCount !== 1 ? "es" : ""}
                </div>
                <button
                  onClick={() => handleToggle(m)}
                  className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    m.isActive
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {m.isActive ? "Activo" : "Inactivo"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o: boolean) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar plan</DialogTitle>
          </DialogHeader>
          {editing && (
            <MembershipForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
