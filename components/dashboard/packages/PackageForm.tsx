"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SessionPackageItem, CreateSessionPackageInput } from "@/types/package";

type Props = {
  initial?: SessionPackageItem;
  onSave: (data: CreateSessionPackageInput) => Promise<void>;
  onCancel: () => void;
};

type Evt = { target: { value: string } };

export function PackageForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<CreateSessionPackageInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    sessions: initial?.sessions ?? 10,
    price: initial?.price ?? 0,
    validDays: initial?.validDays ?? 0,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  function set<K extends keyof CreateSessionPackageInput>(key: K, val: CreateSessionPackageInput[K]) {
    setForm((f: CreateSessionPackageInput) => ({ ...f, [key]: val }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del paquete *</Label>
        <Input id="name" value={form.name} onChange={(e: Evt) => set("name", e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" value={form.description ?? ""} onChange={(e: Evt) => set("description", e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sessions">Sesiones incluidas *</Label>
          <Input id="sessions" type="number" min={1} value={form.sessions} onChange={(e: Evt) => set("sessions", Number(e.target.value))} required />
        </div>
        <div>
          <Label htmlFor="price">Precio (CLP) *</Label>
          <Input id="price" type="number" min={0} value={form.price} onChange={(e: Evt) => set("price", Number(e.target.value))} required />
        </div>
      </div>
      <div>
        <Label htmlFor="validDays">Válido por (días, 0 = sin vencimiento)</Label>
        <Input id="validDays" type="number" min={0} value={form.validDays ?? 0} onChange={(e: Evt) => set("validDays", Number(e.target.value))} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading} className="bg-[#0D1B2A] text-white hover:bg-[#1a2f45]">
          {loading ? "Guardando..." : initial ? "Guardar cambios" : "Crear paquete"}
        </Button>
      </div>
    </form>
  );
}
