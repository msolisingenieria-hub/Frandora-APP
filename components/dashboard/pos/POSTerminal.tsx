"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, Banknote, Smartphone, Check, Loader2, X,
} from "lucide-react";
import type { ProductListItem } from "@/lib/services/inventory.service";

type CartItem = ProductListItem & { quantity: number; total: number };
type PayMethod = "CASH" | "CARD" | "TRANSFER" | "QR";

const METHOD_ICONS: Record<PayMethod, React.ElementType> = {
  CASH: Banknote,
  CARD: CreditCard,
  TRANSFER: Smartphone,
  QR: Smartphone,
};
const METHOD_LABELS: Record<PayMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  QR: "QR/Billetera",
};

export function POSTerminal() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [method, setMethod] = useState<PayMethod>("CARD");
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{ total: number } | null>(null);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/inventory?${params}`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }, [search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const addToCart = (product: ProductListItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.salePrice }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1, total: product.salePrice }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, quantity: i.quantity + delta, total: (i.quantity + delta) * i.salePrice } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const total    = subtotal - discount + tip;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, unitPrice: i.salePrice })),
          method,
          discount,
          tip,
        }),
      });
      if (!res.ok) throw new Error("Error al procesar venta");
      const data = await res.json();
      setSuccess({ total: data.total });
      setCart([]);
      setDiscount(0);
      setTip(0);
    } catch {
      alert("Error al procesar la venta. Intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check size={36} className="text-emerald-600" />
        </div>
        <h2 className="text-brand-navy font-sans font-bold text-2xl mb-1">¡Venta completada!</h2>
        <p className="text-slate-400 font-body mb-6">
          Total: <span className="text-brand-navy font-semibold">${success.total.toLocaleString("es-CL")}</span>
        </p>
        <button
          onClick={() => setSuccess(null)}
          className="px-8 py-3 rounded-xl font-sans font-semibold text-white transition-all hover:-translate-y-px"
          style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
        >
          Nueva venta
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      {/* ── Productos ── */}
      <div className="lg:col-span-3 space-y-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto o escanear código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy shadow-brand-sm"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock === 0}
              className="bg-white rounded-2xl border border-slate-100 shadow-brand-sm p-4 text-left hover:border-brand-teal/40 hover:shadow-brand transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-brand-teal/10 transition-colors">
                <ShoppingCart size={16} className="text-slate-400 group-hover:text-brand-teal transition-colors" />
              </div>
              <p className="text-brand-navy font-sans font-semibold text-sm leading-tight mb-1 line-clamp-2">{p.name}</p>
              <p className="text-brand-teal font-sans font-bold text-sm">${p.salePrice.toLocaleString("es-CL")}</p>
              <p className="text-slate-400 text-[11px] font-body mt-0.5">Stock: {p.stock} {p.unit}</p>
            </button>
          ))}
          {products.length === 0 && (
            <div className="col-span-3 py-12 text-center text-slate-400 text-sm font-body">
              {search ? "Sin resultados" : "Agrega productos al inventario"}
            </div>
          )}
        </div>
      </div>

      {/* ── Carrito / Cobro ── */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-brand flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-brand-navy" />
            <h3 className="font-sans font-semibold text-brand-navy text-sm">Carrito</h3>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[180px]">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-300 text-sm font-body text-center">
                Selecciona productos<br />para agregar al carrito
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-brand-navy font-sans font-medium text-xs truncate">{item.name}</p>
                  <p className="text-slate-400 text-[11px] font-body">${item.salePrice.toLocaleString("es-CL")} c/u</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    {item.quantity === 1 ? <X size={11} className="text-red-400" /> : <Minus size={11} className="text-slate-500" />}
                  </button>
                  <span className="w-6 text-center text-xs font-sans font-bold text-brand-navy">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <Plus size={11} className="text-slate-500" />
                  </button>
                </div>
                <span className="text-brand-navy font-sans font-semibold text-xs w-16 text-right">
                  ${item.total.toLocaleString("es-CL")}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Totals + payment */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Discount + tip */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider">Descuento $</label>
              <input type="number" min={0} value={discount || ""}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-2.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 font-body text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider">Propina $</label>
              <input type="number" min={0} value={tip || ""}
                onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-2.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 font-body text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
                placeholder="0"
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="grid grid-cols-2 gap-2">
            {(["CASH", "CARD", "TRANSFER", "QR"] as PayMethod[]).map((m) => {
              const Icon = METHOD_ICONS[m];
              return (
                <button key={m} onClick={() => setMethod(m)}
                  className={[
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-sans font-semibold transition-all",
                    method === m
                      ? "border-brand-teal bg-brand-teal/8 text-brand-navy"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}>
                  <Icon size={13} />
                  {METHOD_LABELS[m]}
                </button>
              );
            })}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <span className="font-sans font-bold text-brand-navy">Total</span>
            <span className="font-sans font-bold text-brand-navy text-xl">
              ${total.toLocaleString("es-CL")}
            </span>
          </div>

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full py-3.5 rounded-xl font-sans font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
          >
            {processing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Check size={16} />
                Cobrar ${total.toLocaleString("es-CL")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
