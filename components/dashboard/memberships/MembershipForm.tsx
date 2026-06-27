"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MembershipItem, CreateMembershipInput } from "@/types/membership";

type Props = {
  initial?: MembershipItem;
  onSave: (data: CreateMembershipInput) => Promise<void>;
  onCancel: () => void;
};

type Evt = { target: { value: string } };

const CYCLES = [
  { value: "MONTHLY", label: "Mensual" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "ANNUAL", label: "Anual" },
];

export function MembershipForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<CreateMembershipInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    billingCycle: initial?.billingCycle ?? "MONTHLY",
    sessionsPerCycle: initial?.sessionsPerCycle ?? null,
    discountPercent: initial?.discountPercent ?? 0,
    color: initial?.color ?? "#6FA89E",
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

  function set<K extends keyof CreateMembershipInput>(key: K, val: CreateMembershipInput[K]) {
    setForm((f: CreateMembershipInput) => ({ ...f, [key]: val }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del plan *</Label>
        <Input id="name" value={form.name} onChange={(e: Evt) => set("name", e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" value={form.description ?? ""} onChange={(e: Evt) => set("description", e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Precio (CLP) *</Label>
          <Input id="price" type="number" min={0} value={form.price} onChange={(e: Evt) => set("price", Number(e.target.value))} required />
        </div>
        <div>
          <Label htmlFor="cycle">Ciclo de cobro</Label>
          <select
            id="cycle"
            value={form.billingCycle}
            onChange={(e: Evt) => set("billingCycle", e.target.value as "MONTHLY" | "QUARTERLY" | "ANNUAL")}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {CYCLES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sessions">Sesiones por ciclo (0 = ilimitado)</Label>
          <Input
            id="sessions"
            type="number"
            min={0}
            value={form.sessionsPerCycle ?? 0}
            onChange={(e: Evt) => set("sessionsPerCycle", Number(e.target.value) || null)}
          />
        </div>
        <div>
          <Label htmlFor="discount">Descuento (%)</Label>
          <Input
            id="discount"
            type="number"
            min={0}
            max={100}
            value={form.discountPercent ?? 0}
            onChange={(e: Evt) => set("discountPercent", Number(e.target.value))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="color">Color</Label>
        <div className="flex items-center gap-2">
          <input type="color" id="color" value={form.color ?? "#6FA89E"} onChange={(e: Evt) => set("color", e.target.value)} className="h-10 w-12 rounded border cursor-pointer" />
          <span className="text-sm text-gray-500">{form.color}</span>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading} className="bg-[#0D1B2A] text-white hover:bg-[#1a2f45]">
          {loading ? "Guardando..." : initial ? "Guardar cambios" : "Crear plan"}
        </Button>
      </div>
    </form>
  );
}
