"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Trash2, CheckCircle, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Enrollment = {
  id: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  status: "ENROLLED" | "WAITLISTED" | "CANCELED" | "ATTENDED" | "NO_SHOW";
  checkedInAt: string | null;
};

type GroupClass = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  maxCapacity: number;
  price: number;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  _count: { enrollments: number };
  staff: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
  enrollments?: Enrollment[];
};

type FormState = {
  name: string; description: string; color: string;
  maxCapacity: string; price: string;
  startTime: string; endTime: string; isPublic: boolean;
};

const EMPTY: FormState = {
  name: "", description: "", color: "#6FA89E",
  maxCapacity: "10", price: "0",
  startTime: "", endTime: "", isPublic: true,
};

const STATUS_BADGE: Record<string, string> = {
  ENROLLED:   "bg-blue-100 text-blue-700",
  WAITLISTED: "bg-amber-100 text-amber-700",
  CANCELED:   "bg-slate-100 text-slate-400",
  ATTENDED:   "bg-emerald-100 text-emerald-700",
  NO_SHOW:    "bg-red-100 text-red-600",
};
const STATUS_LABEL: Record<string, string> = {
  ENROLLED: "Inscrito", WAITLISTED: "En espera", CANCELED: "Cancelado",
  ATTENDED: "Asistió",  NO_SHOW: "No asistió",
};

export function ClassesPanel() {
  const [classes,    setClasses]    = useState<GroupClass[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState<FormState>(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [classDetail, setClassDetail] = useState<GroupClass | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/classes");
    if (res.ok) setClasses(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function loadDetail(id: string) {
    setLoadingDetail(true);
    const res = await fetch(`/api/classes/${id}`);
    if (res.ok) setClassDetail(await res.json());
    setLoadingDetail(false);
  }

  function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); setClassDetail(null); return; }
    setExpanded(id);
    loadDetail(id);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:        form.name,
        description: form.description || undefined,
        color:       form.color,
        maxCapacity: Number(form.maxCapacity),
        price:       Number(form.price),
        startTime:   new Date(form.startTime).toISOString(),
        endTime:     new Date(form.endTime).toISOString(),
        isPublic:    form.isPublic,
      }),
    });
    setSaving(false);
    if (res.ok) { setForm(EMPTY); setShowForm(false); load(); }
    else { const d = await res.json(); alert(d.error?.message ?? "Error"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta clase?")) return;
    await fetch(`/api/classes/${id}`, { method: "DELETE" });
    load();
  }

  async function handleCheckIn(classId: string, enrollmentId: string) {
    await fetch(`/api/classes/${classId}/checkin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId }),
    });
    loadDetail(classId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-slate-500 text-sm font-body">
          Clases grupales con cupo máximo. Los inscritos se marcan presentes el día de la clase.
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
          <Plus size={15} /> Nueva clase
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-brand-teal/20 p-6 space-y-4">
          <h3 className="text-brand-navy font-sans font-semibold text-sm">Nueva clase grupal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-body text-slate-500 mb-1 block">Nombre de la clase</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Yoga para principiantes"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Cupo máximo</label>
              <input type="number" min="1" required value={form.maxCapacity}
                onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Precio ($)</label>
              <input type="number" min="0" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Inicio</label>
              <input type="datetime-local" required value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
            <div>
              <label className="text-xs font-body text-slate-500 mb-1 block">Término</label>
              <input type="datetime-local" required value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-brand-navy bg-slate-50 focus:outline-none focus:border-brand-teal" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublic" checked={form.isPublic}
              onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
              className="w-4 h-4 rounded accent-brand-teal" />
            <label htmlFor="isPublic" className="text-xs font-body text-slate-500">
              Visible en la página pública del negocio
            </label>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-body text-slate-500">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-sans font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
              {saving ? "Guardando…" : "Crear clase"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[0,1].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : classes.length === 0 ? (
        <div className="py-12 text-center">
          <Users size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-body">Aún no tienes clases grupales.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(c => {
            const start      = new Date(c.startTime);
            const enrolled   = c._count.enrollments;
            const isFull     = enrolled >= c.maxCapacity;
            const isOpen     = expanded === c.id;

            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-brand-sm overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-brand-navy text-sm">{c.name}</p>
                    <p className="text-xs font-body text-slate-400">
                      {format(start, "d MMM yyyy · HH:mm", { locale: es })} ·{" "}
                      <span className={isFull ? "text-red-500 font-semibold" : "text-emerald-600 font-semibold"}>
                        {enrolled}/{c.maxCapacity} inscritos
                      </span>
                      {c.price > 0 && ` · $${c.price.toLocaleString("es-CL")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleExpand(c.id)}
                      className="text-slate-400 hover:text-brand-navy transition-colors p-1">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button onClick={() => handleDelete(c.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-4">
                    {loadingDetail ? (
                      <p className="text-xs text-slate-400 font-body py-3">Cargando inscritos…</p>
                    ) : !classDetail?.enrollments?.length ? (
                      <p className="text-xs text-slate-400 font-body py-3">Aún no hay inscritos.</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <p className="text-[10px] font-body text-slate-400 uppercase tracking-wide font-semibold">Inscritos</p>
                        {classDetail.enrollments.map(e => (
                          <div key={e.id} className="flex items-center gap-3 py-1.5">
                            <div className="flex-1 min-w-0">
                              <p className="font-body text-brand-navy text-sm font-medium">{e.clientName}</p>
                              {e.clientEmail && <p className="text-xs text-slate-400">{e.clientEmail}</p>}
                            </div>
                            <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[e.status] ?? ""}`}>
                              {STATUS_LABEL[e.status] ?? e.status}
                            </span>
                            {e.status === "ENROLLED" && (
                              <button onClick={() => handleCheckIn(c.id, e.id)}
                                className="flex items-center gap-1 text-[10px] font-body text-emerald-600 hover:text-emerald-700 font-semibold">
                                <UserCheck size={12} /> Marcar llegada
                              </button>
                            )}
                            {e.status === "ATTENDED" && (
                              <CheckCircle size={14} className="text-emerald-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
