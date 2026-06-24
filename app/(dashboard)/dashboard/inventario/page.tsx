"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import { ProductsTable } from "@/components/dashboard/inventory/ProductsTable";
import { ProductDrawer } from "@/components/dashboard/inventory/ProductDrawer";
import type { ProductListItem } from "@/lib/services/inventory.service";

export default function InventarioPage() {
  const [selected, setSelected] = useState<ProductListItem | null>(null);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "new" | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <Archive size={18} className="text-brand-teal" />
          <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">Inventario</p>
        </div>
        <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
          Productos
        </h1>
      </div>

      <ProductsTable
        onSelectProduct={(p) => { setSelected(p); setDrawerMode("view"); }}
        onNewProduct={() => { setSelected(null); setDrawerMode("new"); }}
        refreshTrigger={refreshTrigger}
      />

      {drawerMode && (
        <ProductDrawer
          product={selected}
          mode={drawerMode}
          onClose={() => { setDrawerMode(null); setSelected(null); }}
          onSaved={() => setRefreshTrigger((n) => n + 1)}
        />
      )}
    </div>
  );
}
