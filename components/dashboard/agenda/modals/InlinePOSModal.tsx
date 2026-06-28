"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, CreditCard, Banknote, Smartphone, QrCode } from "lucide-react";
import type { AppointmentListItem } from "@/lib/services/appointment.service";

interface Props {
  appointment: AppointmentListItem;
  isOpen:      boolean;
  onClose:     () => void;
  onSuccess:   (paymentId: string) => void;
}

const METHODS = [
  { id: "CASH",     label: "Efectivo",      icon: Banknote    },
  { id: "CARD",     label: "Tarjeta",        icon: CreditCard  },
  { id: "TRANSFER", label: "Transferencia",  icon: Smartphone  },
  { id: "QR",       label: "QR",             icon: QrCode      },
] as const;

export function InlinePOSModal({ appointment, isOpen, onClose, onSuccess }: Props) {
  const basePrice = Number(appointment.totalPrice ?? 0);
  const [method,   setMethod]   = useState<string>("CASH");
  const [amount,   setAmount]   = useState(basePrice);
  const [tip,      setTip]      = useState(0);
  const [discount, setDiscount] = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const total = Math.max(amount + tip - discount, 0);

  if (!isOpen) return null;

  async function handleCharge() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, amount, tip, discount }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Error al cobrar");
      const { paymentId } = await res.json();
      setSuccess(true);
      setTimeout(() => { onSuccess(paymentId); onClose(); }, 1500);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-brand-lg w-full sm:max-w-sm p-6 animate-slide-in-right">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-sans font-semibold text-brand-navy text-lg">Cobrar cita</h2>
            <p className="text-slate-500 text-sm font-body">{appointment.clientName} · {appointment.services?.[0]?.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <p className="font-sans font-semibold text-brand-navy">¡Cobro registrado!</p>
            <p className="text-slate-400 text-sm font-body">${total.toLocaleString("es-CL")}</p>
          </div>
        ) : (
          <>
            {/* Método de pago */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {METHODS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setMethod(id)}
                  className={["flex flex-col items-center gap-1 rounded-xl p-2.5 border-2 transition-all text-xs font-sans font-semibold",
                    method === id ? "border-brand-navy bg-brand-navy text-white" : "border-slate-200 text-slate-600 hover:border-slate-300",
                  ].join(" ")}>
                  <Icon size={18} />
                  <span className="text-[9px]">{label}</span>
                </button>
              ))}
            </div>

            {/* Monto */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Propina</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="number" min={0} value={tip} onChange={(e) => setTip(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body bg-slate-50 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-700 mb-1">Descuento</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body bg-slate-50 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-rose-600 text-xs font-body mb-3">{error}</p>}

            {/* Total y botón */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-body text-slate-400">Total</p>
                <p className="text-2xl font-sans font-bold text-brand-navy">${total.toLocaleString("es-CL")}</p>
              </div>
              <button onClick={handleCharge} disabled={loading || total <= 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-sans font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}>
                {loading ? <><Loader2 size={14} className="animate-spin" />Cobrando...</> : `Cobrar $${total.toLocaleString("es-CL")}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
