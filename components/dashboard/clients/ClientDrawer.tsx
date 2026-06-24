"use client";

import { useState, useEffect } from "react";
import {
  X, User, Phone, Mail, Calendar, Tag, FileText,
  AlertTriangle, Heart, ChevronRight, Edit2, Check, Loader2,
} from "lucide-react";
import type { ClientListItem, ClientDetail } from "@/lib/services/client.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Mode = "view" | "edit" | "new";

type Props = {
  client?: ClientListItem | null;
  mode: Mode;
  onClose: () => void;
  onSaved: () => void;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELED: "Cancelada",
  NO_SHOW: "No asistió",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-brand-teal/15 text-brand-teal",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-slate-100 text-slate-500",
  NO_SHOW: "bg-red-100 text-red-600",
};

export function ClientDrawer({ client, mode: initialMode, onClose, onSaved }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", birthdate: "",
    gender: "", notes: "", allergies: "", preferences: "", tags: "",
  });

  useEffect(() => {
    if (client && mode === "view") {
      setLoadingDetail(true);
      fetch(`/api/clients/${client.id}`)
        .then((r) => r.json())
        .then((d) => setDetail(d))
        .finally(() => setLoadingDetail(false));
    }
  }, [client, mode]);

  useEffect(() => {
    if (mode === "edit" && detail) {
      setForm({
        name: detail.name,
        email: detail.email ?? "",
        phone: detail.phone ?? "",
        birthdate: detail.birthdate ? detail.birthdate.toString().slice(0, 10) : "",
        gender: detail.gender ?? "",
        notes: detail.notes ?? "",
        allergies: detail.allergies ?? "",
        preferences: detail.preferences ?? "",
        tags: detail.tags.join(", "),
      });
    } else if (mode === "new") {
      setForm({ name: "", email: "", phone: "", birthdate: "", gender: "", notes: "", allergies: "", preferences: "", tags: "" });
    }
  }, [mode, detail]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        birthdate: form.birthdate || null,
        gender: form.gender || null,
        notes: form.notes || null,
        allergies: form.allergies || null,
        preferences: form.preferences || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };

      if (mode === "new") {
        await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else if (mode === "edit" && client) {
        await fetch(`/api/clients/${client.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, icon: React.ReactNode, value: string, key: keyof typeof form, type = "text") => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {icon} {label}
      </label>
      {key === "notes" || key === "allergies" || key === "preferences" ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3347 100%)" }}>
          <div className="flex items-center gap-3">
            {client && mode !== "new" ? (
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white font-sans font-bold text-sm">
                {client.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <User size={18} className="text-white/80" />
              </div>
            )}
            <div>
              <p className="text-white font-sans font-semibold text-sm">
                {mode === "new" ? "Nuevo cliente" : mode === "edit" ? "Editar cliente" : (client?.name ?? "")}
              </p>
              {mode === "view" && client && (
                <p className="text-white/50 text-xs font-body">{client.totalAppointments} citas · {client.loyaltyPoints} pts</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "view" && (
              <button onClick={() => setMode("edit")} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Edit2 size={14} className="text-white" />
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ── VIEW MODE ── */}
          {mode === "view" && (
            <div className="p-5 space-y-5">
              {loadingDetail ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : detail ? (
                <>
                  {/* Info cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Email", value: detail.email, icon: <Mail size={13} /> },
                      { label: "Teléfono", value: detail.phone, icon: <Phone size={13} /> },
                      { label: "Nacimiento", value: detail.birthdate ? format(new Date(detail.birthdate), "d MMM yyyy", { locale: es }) : null, icon: <Calendar size={13} /> },
                      { label: "Género", value: detail.gender, icon: <User size={13} /> },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider mb-1">
                          {item.icon} {item.label}
                        </div>
                        <p className="text-brand-navy text-sm font-body truncate">
                          {item.value ?? <span className="text-slate-300">—</span>}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  {detail.tags.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <Tag size={12} /> Tags
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.tags.map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-brand-teal/10 text-brand-teal font-sans font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  {detail.notes && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <FileText size={12} /> Notas
                      </p>
                      <p className="text-sm text-slate-600 font-body leading-relaxed bg-slate-50 rounded-xl p-3">{detail.notes}</p>
                    </div>
                  )}

                  {/* Alergias */}
                  {detail.allergies && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-sans font-semibold text-amber-600 uppercase tracking-wider mb-2">
                        <AlertTriangle size={12} /> Alergias
                      </p>
                      <p className="text-sm text-amber-700 font-body bg-amber-50 rounded-xl p-3 border border-amber-200">{detail.allergies}</p>
                    </div>
                  )}

                  {/* Preferencias */}
                  {detail.preferences && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <Heart size={12} /> Preferencias
                      </p>
                      <p className="text-sm text-slate-600 font-body leading-relaxed bg-slate-50 rounded-xl p-3">{detail.preferences}</p>
                    </div>
                  )}

                  {/* Historial */}
                  {detail.appointments.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        <Calendar size={12} /> Historial de citas
                      </p>
                      <div className="space-y-2">
                        {detail.appointments.map((a) => (
                          <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                            <div className="min-w-0">
                              <p className="text-brand-navy text-sm font-sans font-medium truncate">
                                {a.services[0]?.name ?? "Servicio"}
                              </p>
                              <p className="text-slate-400 text-xs font-body">
                                {format(new Date(a.startTime), "d MMM yyyy · HH:mm", { locale: es })}
                                {a.staffName && ` · ${a.staffName}`}
                              </p>
                            </div>
                            <span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium ${STATUS_COLORS[a.status] ?? "bg-slate-100 text-slate-500"}`}>
                              {STATUS_LABELS[a.status] ?? a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* ── EDIT / NEW MODE ── */}
          {(mode === "edit" || mode === "new") && (
            <div className="p-5 space-y-4">
              {field("Nombre *", <User size={12} />, form.name, "name")}
              {field("Email", <Mail size={12} />, form.email, "email", "email")}
              {field("Teléfono", <Phone size={12} />, form.phone, "phone", "tel")}
              {field("Fecha de nacimiento", <Calendar size={12} />, form.birthdate, "birthdate", "date")}

              <div>
                <label className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <User size={12} /> Género
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy"
                >
                  <option value="">No especificado</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="No binario">No binario</option>
                  <option value="Prefiero no decir">Prefiero no decir</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Tag size={12} /> Tags <span className="normal-case font-normal">(separadas por comas)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  placeholder="ej: VIP, recurrente, referido"
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy"
                />
              </div>

              {field("Notas internas", <FileText size={12} />, form.notes, "notes")}
              {field("Alergias / Contraindicaciones", <AlertTriangle size={12} />, form.allergies, "allergies")}
              {field("Preferencias", <Heart size={12} />, form.preferences, "preferences")}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {(mode === "edit" || mode === "new") && (
          <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => mode === "edit" ? setMode("view") : onClose()}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-sans font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 py-2.5 rounded-xl text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {mode === "new" ? "Crear cliente" : "Guardar cambios"}
            </button>
          </div>
        )}

        {mode === "view" && (
          <div className="px-5 py-4 border-t border-slate-100">
            <button
              onClick={() => setMode("edit")}
              className="w-full py-2.5 rounded-xl font-sans font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
            >
              <Edit2 size={14} />
              Editar cliente
              <ChevronRight size={14} className="ml-auto" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
