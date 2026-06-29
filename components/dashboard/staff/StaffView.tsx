"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Mail, Calendar, MoreVertical, Pencil, Trash2,
  Clock, TrendingUp, ChevronDown, ChevronUp,
} from "lucide-react";
import { StaffForm } from "./StaffForm";
import { StaffScheduleModal } from "./StaffScheduleModal";
import { InviteModal } from "./InviteModal";

const ROLE_LABEL: Record<string, string> = {
  BUSINESS_OWNER: "Propietario",
  MANAGER:        "Gerente",
  STAFF:          "Profesional",
  RECEPTIONIST:   "Recepcionista",
};

type Schedule = { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean };
type StaffItem = {
  id: string; name: string; email: string|null; phone: string|null;
  bio: string|null; role: string; color: string;
  commissionRate: number|null; commissionType: string;
  isActive: boolean; avatarUrl: string|null; acceptsBookings: boolean;
  schedules: Schedule[];
  _count: { appointments: number };
};

type CommissionData = { totalRevenue: number; commission: number; appointments: unknown[] };

export function StaffView() {
  const [list,         setList]        = useState<StaffItem[]>([]);
  const [loading,      setLoading]     = useState(true);
  const [showForm,     setShowForm]    = useState(false);
  const [editTarget,   setEditTarget]  = useState<StaffItem|null>(null);
  const [schedTarget,  setSchedTarget] = useState<StaffItem|null>(null);
  const [showInvite,   setShowInvite]  = useState(false);
  const [expanded,     setExpanded]    = useState<string|null>(null);
  const [commissions,  setCommissions] = useState<Record<string, CommissionData>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/staff");
    if (res.ok) setList(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function loadCommissions(staffId: string) {
    if (commissions[staffId]) return;
    const res = await fetch(`/api/staff/${staffId}/commissions`);
    if (res.ok) setCommissions(c => ({ ...c, [staffId]: (async () => res.json())().then(d => d) as unknown as CommissionData }));
    const data = await res.json();
    setCommissions(c => ({ ...c, [staffId]: data }));
  }

  function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    loadCommissions(id);
  }

  async function handleCreate(data: Record<string, unknown>) {
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { setShowForm(false); load(); }
    else { const d = await res.json(); alert(d.error?.message ?? "Error"); }
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!editTarget) return;
    const res = await fetch(`/api/staff/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { setEditTarget(null); load(); }
    else { const d = await res.json(); alert(d.error?.message ?? "Error"); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Desactivar a ${name}? Seguirá en las citas existentes.`)) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    load();
  }

  const active   = list.filter(s => s.isActive);
  const inactive = list.filter(s => !s.isActive);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-brand-navy font-sans font-bold text-xl md:text-2xl">Equipo</h1>
          <p className="text-slate-400 text-sm font-body mt-0.5">
            {active.length} {active.length === 1 ? "profesional activo" : "profesionales activos"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-semibold text-brand-navy border border-brand-navy/20 hover:bg-brand-navy/5 transition-colors">
            <Mail size={15} /> Invitar
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
            <UserPlus size={15} /> Nuevo profesional
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[0,1,2].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : active.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} className="text-slate-300" />
          </div>
          <p className="font-sans font-semibold text-brand-navy text-sm mb-1">Aún no hay profesionales</p>
          <p className="text-slate-400 text-xs font-body mb-5">Agrega los integrantes de tu equipo</p>
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-sans font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
            Agregar primero
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map(staff => (
            <div key={staff.id} className="bg-white rounded-2xl border border-slate-100 shadow-brand overflow-hidden">
              {/* Fila principal */}
              <div className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-sans font-bold text-sm shrink-0"
                  style={{ backgroundColor: staff.color }}>
                  {staff.name.slice(0,2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-sans font-semibold text-brand-navy text-sm">{staff.name}</p>
                    <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {ROLE_LABEL[staff.role] ?? staff.role}
                    </span>
                  </div>
                  <p className="text-xs font-body text-slate-400 mt-0.5">
                    {staff.email ?? ""}{staff.email && staff.phone ? " · " : ""}{staff.phone ?? ""}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-body text-slate-400">
                      <span className="font-semibold text-brand-navy">{staff._count.appointments}</span> citas
                    </span>
                    {(staff.commissionRate ?? 0) > 0 && (
                      <span className="text-[10px] font-body text-brand-teal font-semibold">
                        {staff.commissionType === "PERCENT" ? `${staff.commissionRate}% comisión` : `$${staff.commissionRate} por cita`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setSchedTarget(staff)} title="Horarios"
                    className="p-2 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-colors">
                    <Calendar size={15} />
                  </button>
                  <button onClick={() => setEditTarget(staff)} title="Editar"
                    className="p-2 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(staff.id, staff.name)} title="Desactivar"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => toggleExpand(staff.id)} title="Ver detalle"
                    className="p-2 rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-colors">
                    {expanded === staff.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Panel expandible: horarios + comisiones */}
              {expanded === staff.id && (
                <div className="border-t border-slate-100 px-4 py-4 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Horarios */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={13} className="text-brand-teal" />
                      <p className="text-xs font-sans font-semibold text-brand-navy">Horario semanal</p>
                    </div>
                    {staff.schedules.length === 0 ? (
                      <p className="text-xs font-body text-slate-400">Sin horario definido</p>
                    ) : (
                      <div className="space-y-1">
                        {staff.schedules.map(s => (
                          <p key={s.dayOfWeek} className="text-xs font-body text-slate-600">
                            <span className="font-semibold w-20 inline-block">
                              {["","Lun","Mar","Mié","Jue","Vie","Sáb","Dom"][s.dayOfWeek]}
                            </span>
                            {s.startTime} — {s.endTime}
                          </p>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setSchedTarget(staff)}
                      className="mt-2 text-[11px] font-body font-semibold text-brand-teal hover:underline">
                      Editar horario →
                    </button>
                  </div>

                  {/* Comisiones del mes */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={13} className="text-brand-teal" />
                      <p className="text-xs font-sans font-semibold text-brand-navy">Comisiones este mes</p>
                    </div>
                    {commissions[staff.id] ? (
                      <div className="space-y-1">
                        <p className="text-xs font-body text-slate-600">
                          Citas completadas: <span className="font-semibold text-brand-navy">{(commissions[staff.id] as CommissionData).appointments.length}</span>
                        </p>
                        <p className="text-xs font-body text-slate-600">
                          Ingresos generados: <span className="font-semibold text-brand-navy">${((commissions[staff.id] as CommissionData).totalRevenue).toLocaleString("es-CL")}</span>
                        </p>
                        <p className="text-xs font-body text-brand-teal font-semibold">
                          Total comisión: ${Math.round((commissions[staff.id] as CommissionData).commission).toLocaleString("es-CL")}
                        </p>
                      </div>
                    ) : (
                      <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Desactivados */}
          {inactive.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs font-body text-slate-400 cursor-pointer hover:text-slate-600 flex items-center gap-1">
                <MoreVertical size={12} /> {inactive.length} profesional{inactive.length > 1 ? "es" : ""} desactivado{inactive.length > 1 ? "s" : ""}
              </summary>
              <div className="mt-2 space-y-2">
                {inactive.map(staff => (
                  <div key={staff.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 opacity-50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: staff.color }}>
                      {staff.name.slice(0,2).toUpperCase()}
                    </div>
                    <p className="text-sm font-body text-slate-500 flex-1">{staff.name}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Modales */}
      {showForm && (
        <StaffForm
          title="Nuevo profesional"
          onSave={data => handleCreate(data as Record<string, unknown>)}
          onCancel={() => setShowForm(false)}
        />
      )}
      {editTarget && (
        <StaffForm
          title={`Editar — ${editTarget.name}`}
          initial={{
            name: editTarget.name, email: editTarget.email ?? "",
            phone: editTarget.phone ?? "", bio: editTarget.bio ?? "",
            role: editTarget.role, color: editTarget.color,
            commissionRate: editTarget.commissionRate ?? 0,
            commissionType: editTarget.commissionType,
            acceptsBookings: editTarget.acceptsBookings ?? true,
            avatarUrl: editTarget.avatarUrl ?? "",
          }}
          onSave={data => handleEdit(data as Record<string, unknown>)}
          onCancel={() => setEditTarget(null)}
        />
      )}
      {schedTarget && (
        <StaffScheduleModal
          staffId={schedTarget.id}
          staffName={schedTarget.name}
          initial={schedTarget.schedules}
          onClose={() => setSchedTarget(null)}
          onSaved={load}
        />
      )}
      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} onSaved={load} />
      )}
    </>
  );
}
