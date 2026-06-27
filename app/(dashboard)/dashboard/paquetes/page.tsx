"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Plus } from "lucide-react";
import { PackageList } from "@/components/dashboard/packages/PackageList";
import { PackageForm } from "@/components/dashboard/packages/PackageForm";
import { SellPackageModal } from "@/components/dashboard/packages/SellPackageModal";
import type { SessionPackageItem, CreateSessionPackageInput } from "@/types/package";

export default function PaquetesPage() {
  const [packages, setPackages] = useState<SessionPackageItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selling, setSelling] = useState<SessionPackageItem | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/packages");
    setPackages(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(data: CreateSessionPackageInput) {
    await fetch("/api/packages", {
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
          <Package size={22} className="text-[#6FA89E]" />
          <h1 className="text-xl md:text-2xl font-bold text-[#0D1B2A]">Paquetes de sesiones</h1>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#0D1B2A] text-white hover:bg-[#1a2f45]">
          <Plus size={16} className="mr-1" /> Nuevo paquete
        </Button>
      </div>

      <PackageList packages={packages} onRefresh={load} onSell={setSelling} />

      <Dialog open={showCreate} onOpenChange={(o: boolean) => !o && setShowCreate(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Crear paquete de sesiones</DialogTitle></DialogHeader>
          <PackageForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>

      <SellPackageModal
        pkg={selling}
        open={!!selling}
        onClose={() => setSelling(null)}
        onSuccess={load}
      />
    </div>
  );
}
