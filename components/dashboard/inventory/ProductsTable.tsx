"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, AlertTriangle, Package } from "lucide-react";
import type { ProductListItem } from "@/lib/services/inventory.service";

type Props = {
  onSelectProduct: (p: ProductListItem) => void;
  onNewProduct: () => void;
  refreshTrigger?: number;
};

export function ProductsTable({ onSelectProduct, onNewProduct, refreshTrigger }: Props) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetch_(); }, [fetch_, refreshTrigger]);

  const lowStockCount = products.filter((p) => p.lowStock).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={onNewProduct}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm text-white shrink-0 transition-all hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
          >
            <Plus size={15} />
            Nuevo producto
          </button>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <p className="text-amber-700 text-xs font-body">
              <span className="font-semibold">{lowStockCount} producto{lowStockCount > 1 ? "s" : ""}</span> con stock bajo
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Package size={22} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-sans font-medium">
              {search ? "Sin resultados" : "Aún no hay productos"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="text-right px-4 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Costo</th>
                <th className="text-right px-4 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                <th className="text-center px-4 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Package size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-brand-navy group-hover:text-brand-teal transition-colors text-sm">
                          {product.name}
                        </p>
                        {product.sku && (
                          <p className="text-slate-400 text-[11px] font-body">SKU: {product.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden md:table-cell">
                    <span className="text-slate-500 text-sm font-body">
                      ${product.costPrice.toLocaleString("es-CL")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-brand-navy font-sans font-semibold text-sm">
                      ${product.salePrice.toLocaleString("es-CL")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={[
                      "px-2.5 py-1 rounded-full text-xs font-sans font-semibold",
                      product.lowStock
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700",
                    ].join(" ")}>
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-slate-500 text-xs font-body">
                      {product.categoryName ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
