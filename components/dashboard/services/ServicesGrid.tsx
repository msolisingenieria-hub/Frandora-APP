"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Clock, Globe, Lock, Pencil, Trash2, Sparkles } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import type { ServiceListItem } from "@/lib/services/service.service";

// ── Helpers ────────────────────────────────────────────────────────────────

type Mode = "view" | "edit" | "new";

type FormState = {
  name: string; description: string; duration: string;
  price: string; isOnline: boolean;
};

const defaultForm: FormState = {
  name: "", description: "", duration: "30", price: "0", isOnline: true,
};

/** Devuelve una de 6 clases de color basada en el nombre del servicio */
function stringToColor(s: string): string {
  const palette = [
    "bg-[#0D1B2A] text-white",
    "bg-[#6FA89E] text-white",
    "bg-[#CFE3DF] text-[#0D1B2A]",
    "bg-indigo-100 text-indigo-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// ── Sub-componente: formulario dentro del Sheet ────────────────────────────

type ServiceFormProps = {
  form: FormState;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  mode: "new" | "edit";
};

function ServiceForm({ form, onChange, onSave, onCancel, saving, mode }: ServiceFormProps) {
  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...form, [key]: e.target.value });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pt-2">
        {([
          { label: "Nombre *", key: "name" as const, type: "text" },
          { label: "Descripción", key: "description" as const, type: "text" },
          { label: "Duración (minutos) *", key: "duration" as const, type: "number" },
          { label: "Precio (CLP) *", key: "price" as const, type: "number" },
        ] as const).map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {label}
            </label>
            <input
              type={type}
              value={form[key]}
              onChange={set(key)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy transition-colors"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Visibilidad web
          </label>
          <button
            type="button"
            onClick={() => onChange({ ...form, isOnline: !form.isOnline })}
            className={[
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-sans font-semibold transition-all",
              form.isOnline
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500",
            ].join(" ")}
          >
            {form.isOnline ? <Globe size={14} /> : <Lock size={14} />}
            {form.isOnline ? "Visible en web" : "Solo presencial"}
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-5 border-t border-slate-100 mt-5 shrink-0">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-sans font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={saving || !form.name.trim()}
          className="flex-1 py-2.5 rounded-xl text-white font-sans font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-px transition-all"
          style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
        >
          {saving ? "Guardando..." : mode === "new" ? "Crear servicio" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export function ServicesGrid() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [mode, setMode]         = useState<Mode>("view");
  const [editing, setEditing]   = useState<ServiceListItem | null>(null);
  const [form, setForm]         = useState<FormState>(defaultForm);
  const [saving, setSaving]     = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/services");
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Categorías únicas para el filtro
  const categories = ["Todos", ...Array.from(
    new Set(services.map((s) => s.categoryName ?? "Sin categoría"))
  )];

  const filtered = activeCategory === "Todos"
    ? services
    : services.filter((s) => (s.categoryName ?? "Sin categoría") === activeCategory);

  const openNew = () => {
    setForm(defaultForm);
    setEditing(null);
    setMode("new");
  };

  const openEdit = (s: ServiceListItem) => {
    setForm({
      name: s.name, description: s.description ?? "",
      duration: String(s.duration), price: String(s.price), isOnline: s.isOnline,
    });
    setEditing(s);
    setMode("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      duration: parseInt(form.duration) || 30,
      price: parseFloat(form.price) || 0,
      isOnline: form.isOnline,
    };
    try {
      if (mode === "new") {
        await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (editing) {
        await fetch(`/api/services/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      await load();
      setMode("view");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    await load();
  };

  const sheetOpen = mode === "new" || mode === "edit";

  return (
    <>
      {/* ── Sheet de creación / edición ────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) setMode("view"); }}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col">
          <SheetHeader className="mb-6 shrink-0">
            <SheetTitle className="text-brand-navy font-sans font-semibold text-lg">
              {mode === "new" ? "Nuevo servicio" : "Editar servicio"}
            </SheetTitle>
          </SheetHeader>
          <ServiceForm
            form={form}
            onChange={setForm}
            onSave={handleSave}
            onCancel={() => setMode("view")}
            saving={saving}
            mode={mode === "new" ? "new" : "edit"}
          />
        </SheetContent>
      </Sheet>

      {/* ── Barra superior: filtro + botón nuevo ───────────────── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs de categoría — horizontal scrollable en mobile */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                "whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all shrink-0",
                activeCategory === cat
                  ? "text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200",
              ].join(" ")}
              style={activeCategory === cat
                ? { background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }
                : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm text-white hover:-translate-y-px transition-all shrink-0 self-end sm:self-auto"
          style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
        >
          <Plus size={15} /> Nuevo servicio
        </button>
      </div>

      {/* ── Grid de servicios ──────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-sans font-medium mb-1">
            {services.length === 0 ? "Aún no hay servicios" : "Sin servicios en esta categoría"}
          </p>
          <p className="text-slate-400 text-sm font-body mb-6">
            {services.length === 0
              ? "Agrega los servicios que ofrece tu negocio"
              : "Prueba seleccionando otra categoría"}
          </p>
          {services.length === 0 && (
            <button
              onClick={openNew}
              className="px-6 py-2.5 rounded-xl font-sans font-semibold text-sm text-white inline-flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
            >
              <Plus size={15} /> Crear primer servicio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const colorClass = stringToColor(s.name);
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5 hover:border-brand-teal/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  {/* Avatar con color basado en nombre */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-sans font-bold shrink-0 ${colorClass}`}>
                    {initials(s.name)}
                  </div>

                  {/* Acciones hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(s)}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                      <Pencil size={13} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="w-8 h-8 rounded-lg border border-red-100 flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-brand-navy font-sans font-semibold text-sm mb-1 leading-snug">
                  {s.name}
                </h3>

                {s.description && (
                  <p className="text-slate-400 text-xs font-body mb-3 line-clamp-2">
                    {s.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-auto pt-2">
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-body">
                    <Clock size={12} />
                    {s.duration} min
                  </div>
                  <span className="text-brand-navy font-sans font-semibold text-sm">
                    ${s.price.toLocaleString("es-CL")}
                  </span>

                  {/* Badge de visibilidad */}
                  {s.isOnline ? (
                    <span className="ml-auto text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-600">
                      Visible en web
                    </span>
                  ) : (
                    <span className="ml-auto text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                      Solo presencial
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
