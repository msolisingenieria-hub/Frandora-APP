"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  membershipId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Evt = { target: { value: string } };

export function AssignMembershipModal({ membershipId, open, onClose, onSuccess }: Props) {
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!clientId) { setError("Selecciona un cliente"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/memberships/${membershipId}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, startDate, notes: notes || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al asignar membresía");
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
          <DialogTitle>Asignar membresía a cliente</DialogTitle>
        </DialogHeader>
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
            <p className="text-xs text-gray-400 mt-1">Puedes copiar el ID desde la ficha del cliente</p>
          </div>
          <div>
            <Label htmlFor="startDate">Fecha de inicio *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e: Evt) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Input id="notes" value={notes} onChange={(e: Evt) => setNotes(e.target.value)} placeholder="Ej: Pagó en efectivo" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-[#0D1B2A] text-white hover:bg-[#1a2f45]">
              {loading ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
