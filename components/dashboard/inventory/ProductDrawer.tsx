"use client";

import { useState, useEffect } from "react";
import { X, Package, Check, Loader2, Plus, Minus } from "lucide-react";
import type { ProductListItem } from "@/lib/services/inventory.service";

type Mode = "view" | "edit" | "new";

type Props = {
  product?: ProductListItem | null;
  mode: Mode;
  onClose: () => void;
  onSaved: () => void;
};

const UNITS = ["un", "kg", "g", "lt", "ml", "caja", "par", "rollo", "paquete"];

export function ProductDrawer({ product, mode: initialMode, onClose, onSaved }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [saving, setSaving] = useState(false);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState<"PURCHASE" | "ADJUSTMENT" | "RETURN">("PURCHASE");
  const [adjusting, setAdjusting] = useState(false);

  const [form, setForm] = useState({
    name: "", sku: "", costPrice: "0", salePrice: "0",
    stock: "0", minStock: "5", unit: "un", description: "",
  });

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        name: product.name,
        sku: product.sku ?? "",
        costPrice: String(product.costPrice),
        salePrice: String(product.salePrice),
        stock: String(product.stock),
        minStock: String(product.minStock),
        unit: product.unit,
        description: "",
      });
    } else if (mode === "new") {
      setForm({ name: "", sku: "", costPrice: "0", salePrice: "0", stock: "0", minStock: "5", unit: "un", description: "" });
    }
  }, [mode, product]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        costPrice: parseFloat(form.costPrice) || 0,
        salePrice: parseFloat(form.salePrice) || 0,
        stock: parseInt(form.stock) || 0,
        minStock: parseInt(form.minStock) || 5,
        unit: form.unit,
        description: form.description || null,
      };
      if (mode === "new") {
        await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else if (product) {
        await fetch(`/api/inventory/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      onSaved(); onClose();
    } finally { setSaving(false); }
  };

  const handleAdjust = async () => {
    if (!product) return;
    setAdjusting(true);
    try {
      await fetch(`/api/inventory/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: adjustQty, type: adjustType }),
      });
      onSaved(); onClose();
    } finally { setAdjusting(false); }
  };

  const f = (label: string, key: keyof typeof form, type = "text") => (
    <div>
      <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy"
      />
    </div>
  );

  const margin = product
    ? ((product.salePrice - product.costPrice) / product.salePrice * 100).toFixed(0)
    : "0";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3347 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Package size={18} className="text-white/80" />
            </div>
            <div>
              <p className="text-white font-sans font-semibold text-sm">
                {mode === "new" ? "Nuevo producto" : mode === "edit" ? "Editar producto" : (product?.name ?? "")}
              </p>
              {mode === "view" && product && (
                <p className="text-white/50 text-xs font-body">Margen: {margin}%</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── VIEW ── */}
          {mode === "view" && product && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Precio venta", value: `$${product.salePrice.toLocaleString("es-CL")}` },
                  { label: "Costo", value: `$${product.costPrice.toLocaleString("es-CL")}` },
                  { label: "Stock", value: `${product.stock} ${product.unit}` },
                  { label: "Stock mínimo", value: `${product.minStock} ${product.unit}` },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                    <p className={`text-brand-navy text-sm font-body font-semibold ${item.label === "Stock" && product.lowStock ? "text-amber-600" : ""}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {product.lowStock && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Package size={14} className="text-amber-500 shrink-0" />
                  <p className="text-amber-700 text-xs font-body">
                    Stock bajo. Considera reabastecer pronto.
                  </p>
                </div>
              )}

              {/* Ajustar stock */}
              <div>
                <p className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-3">Ajustar stock</p>
                <div className="space-y-3">
                  <select value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as typeof adjustType)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 font-body text-brand-navy">
                    <option value="PURCHASE">Ingreso de compra</option>
                    <option value="ADJUSTMENT">Ajuste manual</option>
                    <option value="RETURN">Devolución</option>
                  </select>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAdjustQty(Math.max(1, adjustQty - 1))}
                      className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                      <Minus size={14} className="text-brand-navy" />
                    </button>
                    <input type="number" min={1} value={adjustQty}
                      onChange={(e) => setAdjustQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-center font-body text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                    />
                    <button onClick={() => setAdjustQty(adjustQty + 1)}
                      className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                      <Plus size={14} className="text-brand-navy" />
                    </button>
                  </div>
                  <button onClick={handleAdjust} disabled={adjusting}
                    className="w-full py-2.5 rounded-xl border-2 border-brand-teal text-brand-teal font-sans font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-teal/5 transition-colors disabled:opacity-60">
                    {adjusting ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
                    Confirmar ajuste
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── EDIT / NEW ── */}
          {(mode === "edit" || mode === "new") && (
            <div className="space-y-4">
              {f("Nombre *", "name")}
              {f("SKU / Código", "sku")}
              <div className="grid grid-cols-2 gap-3">
                {f("Precio venta *", "salePrice", "number")}
                {f("Precio costo", "costPrice", "number")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {f("Stock inicial", "stock", "number")}
                {f("Stock mínimo", "minStock", "number")}
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Unidad</label>
                <select value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 font-body text-brand-navy">
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {f("Descripción", "description")}
            </div>
          )}
        </div>

        {/* Footer */}
        {(mode === "edit" || mode === "new") && (
          <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
            <button onClick={() => mode === "edit" ? setMode("view") : onClose()}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-sans font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="flex-1 py-2.5 rounded-xl text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {mode === "new" ? "Crear producto" : "Guardar"}
            </button>
          </div>
        )}
        {mode === "view" && (
          <div className="px-5 py-4 border-t border-slate-100">
            <button onClick={() => setMode("edit")}
              className="w-full py-2.5 rounded-xl font-sans font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
              Editar producto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
