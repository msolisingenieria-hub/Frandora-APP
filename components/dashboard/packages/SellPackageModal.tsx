"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionPackageItem } from "@/types/package";

type Props = {
  pkg: SessionPackageItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Evt = { target: { value: string } };

function fmt(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export function SellPackageModal({ pkg, open, onClose, onSuccess }: Props) {
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!pkg || !clientId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/packages/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, packageId: pkg.id, notes: notes || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al vender paquete");
        return;
      }
      setClientId("");
      setNotes("");
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vender paquete a cliente</DialogTitle>
        </DialogHeader>
        {pkg && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="font-medium text-[#0D1B2A]">{pkg.name}</p>
            <p className="text-sm text-gray-500">{pkg.sessions} sesiones · {fmt(pkg.price)}</p>
            {pkg.validDays > 0 && <p className="text-xs text-gray-400">Vigencia: {pkg.validDays} días desde la compra</p>}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clientId">ID del cliente *</Label>
            <Input
              id="clientId"
              placeholder="Pega el ID del cliente"
              value={clientId}
              onChange={(e: Evt) => setClientId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="notes">Notas de venta</Label>
            <Input id="notes" value={notes} onChange={(e: Evt) => setNotes(e.target.value)} placeholder="Ej: Pagado en efectivo" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || !pkg} className="bg-[#0D1B2A] text-white hover:bg-[#1a2f45]">
              {loading ? "Procesando..." : "Confirmar venta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
