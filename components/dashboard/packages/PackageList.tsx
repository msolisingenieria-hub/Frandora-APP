"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Trash2, ShoppingBag } from "lucide-react";
import { PackageForm } from "./PackageForm";
import type { SessionPackageItem, CreateSessionPackageInput } from "@/types/package";

type Props = {
  packages: SessionPackageItem[];
  onRefresh: () => void;
  onSell: (pkg: SessionPackageItem) => void;
};

function fmt(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export function PackageList({ packages, onRefresh, onSell }: Props) {
  const [editing, setEditing] = useState<SessionPackageItem | null>(null);

  async function handleUpdate(data: CreateSessionPackageInput) {
    if (!editing) return;
    await fetch(`/api/packages/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este paquete?")) return;
    await fetch(`/api/packages/${id}`, { method: "DELETE" });
    onRefresh();
  }

  async function handleToggle(pkg: SessionPackageItem) {
    await fetch(`/api/packages/${pkg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    onRefresh();
  }

  if (packages.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">No hay paquetes creados.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-[#0D1B2A]">{p.name}</h3>
                <p className="text-xs text-gray-400">{p.sessions} sesiones</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(p)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {p.description && <p className="text-xs text-gray-500 mb-2">{p.description}</p>}
            <p className="text-2xl font-bold text-[#0D1B2A] mb-1">{fmt(p.price)}</p>
            <p className="text-xs text-gray-400 mb-3">
              {p.validDays > 0 ? `Vigencia: ${p.validDays} días` : "Sin vencimiento"}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-400">{p.soldCount} vendidos</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(p)}
                  className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    p.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {p.isActive ? "Activo" : "Inactivo"}
                </button>
                {p.isActive && (
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => onSell(p)}>
                    <ShoppingBag size={10} className="mr-1" />
                    Vender
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o: boolean) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar paquete</DialogTitle></DialogHeader>
          {editing && <PackageForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
