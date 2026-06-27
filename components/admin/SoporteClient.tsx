"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, AlertCircle, Clock, CheckCircle2, XCircle, Loader2, Send, Lock } from "lucide-react";

const STATUS_CONFIG = {
  OPEN: { label: "Abierto", icon: <AlertCircle size={12} />, class: "bg-rose-100 text-rose-700" },
  IN_REVIEW: { label: "En revisión", icon: <Clock size={12} />, class: "bg-amber-100 text-amber-700" },
  RESOLVED: { label: "Resuelto", icon: <CheckCircle2 size={12} />, class: "bg-emerald-100 text-emerald-700" },
  CLOSED: { label: "Cerrado", icon: <XCircle size={12} />, class: "bg-slate-100 text-slate-500" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Baja", class: "bg-slate-100 text-slate-500" },
  MEDIUM: { label: "Media", class: "bg-blue-100 text-blue-600" },
  HIGH: { label: "Alta", class: "bg-amber-100 text-amber-700" },
  URGENT: { label: "Urgente", class: "bg-red-100 text-red-700" },
};

type Ticket = {
  id: string;
  title: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: Date | string;
  business: { name: string; slug: string };
  _count: { messages: number };
};

type TicketDetail = Ticket & {
  description: string;
  messages: Array<{ id: string; content: string; authorName: string; isInternal: boolean; createdAt: string }>;
};

const STATUS_OPTIONS = ["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"] as const;

export function SoporteClient({ tickets, currentStatus }: { tickets: Ticket[]; currentStatus?: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<TicketDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  async function openTicket(id: string) {
    setLoadingDetail(true);
    const res = await fetch(`/api/admin/tickets/${id}`);
    const data = await res.json() as TicketDetail;
    setSelected(data);
    setLoadingDetail(false);
  }

  async function changeStatus(id: string, status: string) {
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    if (selected?.id === id) setSelected({ ...selected, status: status as TicketDetail["status"] });
  }

  async function sendMessage() {
    if (!selected || !message.trim()) return;
    setSending(true);
    const res = await fetch(`/api/admin/tickets/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message, isInternal }),
    });
    const msg = await res.json() as TicketDetail["messages"][0];
    setSelected({ ...selected, messages: [...selected.messages, msg] });
    setMessage("");
    setSending(false);
  }

  return (
    <div className="flex gap-6">
      {/* Lista de tickets */}
      <div className="w-full lg:w-80 shrink-0 space-y-2">
        {/* Filtro de estado */}
        <div className="flex flex-wrap gap-1 mb-3">
          <a href="/admin/soporte" className={`rounded-full px-3 py-1 text-xs font-sans font-medium ${!currentStatus ? "bg-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            Todos
          </a>
          {STATUS_OPTIONS.map((s) => (
            <a
              key={s}
              href={`/admin/soporte?status=${s}`}
              className={`rounded-full px-3 py-1 text-xs font-sans font-medium ${currentStatus === s ? "bg-navy text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              {STATUS_CONFIG[s].label}
            </a>
          ))}
        </div>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
            <MessageSquare size={24} className="mb-2 text-slate-300" />
            <p className="font-body text-sm text-slate-400">Sin tickets</p>
          </div>
        ) : (
          tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => openTicket(t.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors hover:border-brand-teal/30 hover:bg-brand-mist/20 ${selected?.id === t.id ? "border-brand-teal bg-brand-mist/20" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="font-sans font-semibold text-navy text-sm line-clamp-1">{t.title}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-body font-medium ${PRIORITY_CONFIG[t.priority].class}`}>
                  {PRIORITY_CONFIG[t.priority].label}
                </span>
              </div>
              <p className="font-body text-xs text-slate-400 mb-2">{t.business.name}</p>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-body font-medium ${STATUS_CONFIG[t.status].class}`}>
                  {STATUS_CONFIG[t.status].icon}
                  {STATUS_CONFIG[t.status].label}
                </span>
                <span className="text-[10px] font-body text-slate-400 flex items-center gap-1">
                  <MessageSquare size={9} />{t._count.messages}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Detalle del ticket */}
      <div className="flex-1 min-w-0">
        {loadingDetail ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : !selected ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MessageSquare size={32} className="mb-3 text-slate-200" />
            <p className="font-body text-sm text-slate-400">Selecciona un ticket para ver los detalles</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {/* Header del ticket */}
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-sans font-bold text-navy">{selected.title}</h3>
                  <p className="font-body text-sm text-slate-500 mt-0.5">{selected.business.name}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) => changeStatus(selected.id, e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-sans font-medium focus:outline-none focus:ring-1 focus:ring-brand-teal/30"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
              <p className="mt-3 font-body text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{selected.description}</p>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {selected.messages.length === 0 && (
                <p className="text-center font-body text-sm text-slate-400 py-8">Sin mensajes aún</p>
              )}
              {selected.messages.map((m) => (
                <div key={m.id} className={`rounded-xl p-3 ${m.isInternal ? "bg-amber-50 border border-amber-100" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-xs font-semibold text-slate-700">{m.authorName}</span>
                    {m.isInternal && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-body text-amber-700">
                        <Lock size={8} /> Interno
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-slate-600">{m.content}</p>
                </div>
              ))}
            </div>

            {/* Enviar mensaje */}
            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setIsInternal(false)}
                  className={`rounded-full px-3 py-1 text-xs font-body font-medium ${!isInternal ? "bg-navy text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  Respuesta pública
                </button>
                <button
                  onClick={() => setIsInternal(true)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-body font-medium ${isInternal ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  <Lock size={9} /> Nota interna
                </button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMessage(); }}
                  rows={2}
                  placeholder="Escribe tu respuesta... (Ctrl+Enter para enviar)"
                  className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm font-body focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal/30"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !message.trim()}
                  className="self-end rounded-xl bg-navy p-2.5 text-white disabled:opacity-40 hover:bg-navy/90 transition-colors"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
