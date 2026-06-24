"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Bell, CheckCircle, Trash2, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type WaitlistEntry = {
  id: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  preferredDate: string | null;
  notes: string | null;
  status: "WAITING" | "NOTIFIED" | "CONFIRMED" | "EXPIRED";
  createdAt: string;
  notifiedAt: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  WAITING:  "bg-amber-100 text-amber-700",
  NOTIFIED: "bg-blue-100 text-blue-700",
  CONFIRMED:"bg-emerald-100 text-emerald-700",
  EXPIRED:  "bg-slate-100 text-slate-400",
};
const STATUS_LABEL: Record<string, string> = {
  WAITING:  "Esperando", NOTIFIED: "Avisado",
  CONFIRMED:"Confirmado", EXPIRED: "Venció",
};

type FormState = {
  clientName: string; clientEmail: string; clientPhone: string;
  preferredDate: string; notes: string;
};
const EMPTY: FormState = { clientName: "", clientEmail: "", clientPhone: "", preferredDate: "", notes: "" };

export function WaitlistPanel() {
  const [list,     setList]     = useState<WaitlistEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState<FormState>(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/waitlist");
    if (res.ok) setList(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName:    form.clientName,
        clientEmail:   form.clientEmail   || undefined,
        clientPhone:   form.clientPhone   || undefined,
        preferredDate: form.preferredDate ? new Date(form.preferredDate).toISOString() : undefined,
        notes:         form.notes         || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) { setForm(EMPTY); setShowForm(false); load(); }
    else { const d = await res.json(); alert(d.error?.message ?? "Error"); }
  }

  async function doAction(id: string, action: "notify" | "confirm") {
    await fetch(`/api/waitlist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  async function doRemove(id: string) {
    if (!confirm("¿Quitar de la lista de espera?")) return;
    await fetch(`/api/waitlist/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-slate-500 text-sm font-body">
          Clientes que quieren ser atendidos pero no encontraron hora disponible.
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
          <UserPlus size={15} /> Agregar a lista
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-brand-teal/20 p-6 space-y-4">
          <h3 className="text-brand-navy font-sans font-semibold text-sm">Agregar a lista de espera</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Nombre del cliente</label>
              <input required value={form.clientName}
                onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                placeholder="Ej: María González"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Teléfono</label>
              <input value={form.clientPhone}
                onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                placeholder="+56 9 xxxx xxxx"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Correo (opcional)</label>
              <input type="email" value={form.clientEmail}
                onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                placeholder="cliente@correo.cl"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Fecha preferida (opcional)</label>
              <input type="date" value={form.preferredDate}
                onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-body text-slate-500 mb-1 block">Notas</label>
              <input value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Ej: quiere corte + barba con Juan"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-body text-slate-500">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-sans font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
              {saving ? "Guardando…" : "Agregar"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : list.length === 0 ? (
        <div className="py-12 text-center">
          <Clock size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-body">La lista de espera está vacía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(entry => (
            <div key={entry.id} className="bg-white rounded-2xl border border-slate-100 shadow-brand-sm p-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={15} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-sans font-semibold text-brand-navy text-sm">{entry.clientName}</p>
                  <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[entry.status] ?? ""}`}>
                    {STATUS_LABEL[entry.status] ?? entry.status}
                  </span>
                </div>
                <p className="text-xs font-body text-slate-400 mt-0.5">
                  {entry.clientPhone ?? ""}
                  {entry.clientPhone && entry.clientEmail ? " · " : ""}
                  {entry.clientEmail ?? ""}
                </p>
                {entry.preferredDate && (
                  <p className="text-xs font-body text-slate-400">
                    Prefiere: {format(new Date(entry.preferredDate), "d 'de' MMMM", { locale: es })}
                  </p>
                )}
                {entry.notes && <p className="text-xs font-body text-slate-400 italic">&ldquo;{entry.notes}&rdquo;</p>}
                <p className="text-[10px] font-body text-slate-300 mt-1">
                  Agregado el {format(new Date(entry.createdAt), "d MMM", { locale: es })}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {entry.status === "WAITING" && (
                  <button onClick={() => doAction(entry.id, "notify")}
                    title="Avisar que hay hora disponible"
                    className="flex items-center gap-1 text-[10px] font-body text-blue-600 hover:text-blue-700 font-semibold">
                    <Bell size={12} /> Avisar
                  </button>
                )}
                {entry.status === "NOTIFIED" && (
                  <button onClick={() => doAction(entry.id, "confirm")}
                    className="flex items-center gap-1 text-[10px] font-body text-emerald-600 hover:text-emerald-700 font-semibold">
                    <CheckCircle size={12} /> Confirmar
                  </button>
                )}
                <button onClick={() => doRemove(entry.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors self-end">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
