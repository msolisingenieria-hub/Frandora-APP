"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Users, TrendingUp, ArrowRight, Sparkles, Clock, CheckCircle2, Check } from "lucide-react";
import { PublicPageCard } from "@/components/dashboard/PublicPageCard";

type Business = {
  id: string;
  name: string;
  slug: string;
  subscription?: {
    status: string;
    trialEndsAt?: string | null;
    plan?: { name: string } | null;
  } | null;
};

type Stats = { todayAppointments: number; totalClients: number; monthlyRevenue: number };

const SETUP_ITEMS = [
  { label: "Negocio configurado",      done: true  },
  { label: "Servicios agregados",      done: true  },
  { label: "Horarios definidos",       done: true  },
  { label: "Foto de portada",          done: false },
  { label: "Conectar redes sociales",  done: false },
  { label: "Compartir página pública", done: false },
];

const COMING_SOON = [
  "Marketing y recordatorios automáticos",
  "Programa de lealtad y cupones",
  "Gift Cards digitales",
  "Reportes y analytics avanzados",
  "IA asistente de reservas",
];

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats]       = useState<Stats>({ todayAppointments: 0, totalClients: 0, monthlyRevenue: 0 });
  const [loading, setLoading]   = useState(true);
  const [noData, setNoData]     = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/business").then((r) => r.ok ? r.json() : null),
      fetch("/api/dashboard/stats").then((r) => r.ok ? r.json() : null),
    ]).then(([biz, st]) => {
      if (biz && !biz.error) setBusiness(biz);
      else setNoData(true);
      if (st && !st.error) setStats(st);
      setLoading(false);
    }).catch(() => { setLoading(false); setNoData(true); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-8 space-y-4"
        style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (noData || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
        style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}>
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-brand-navy/5 flex items-center justify-center mx-auto">
            <Sparkles size={28} className="text-brand-navy/30" />
          </div>
          <h2 className="text-brand-navy font-sans font-bold text-xl">Configurando tu negocio</h2>
          <p className="text-slate-400 text-sm font-body">
            Tu cuenta se está vinculando. Si este mensaje persiste, intenta cerrar sesión y volver a entrar.
          </p>
          <Link href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-sans font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3d3a 100%)" }}>
            Completar configuración <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const sub = business.subscription;
  const trialDays = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 14;
  const isTrialing = !sub || sub.status === "TRIALING";

  const doneTasks = SETUP_ITEMS.filter((i) => i.done).length;
  const progress  = Math.round((doneTasks / SETUP_ITEMS.length) * 100);

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-brand-teal text-xs tracking-[0.2em] uppercase font-sans font-semibold mb-1">
            Bienvenido de vuelta
          </p>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
            {business.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-body">
            {new Date().toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* ── Trial banner ── */}
        {isTrialing && (
          <div
            className="mb-8 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #162d43 60%, #1a3d3a 100%)" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-12 w-40 h-40 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(111,168,158,0.15) 0%, transparent 70%)" }} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={15} className="text-brand-teal" />
                <p className="text-white font-sans font-semibold text-sm">Prueba gratuita activa</p>
              </div>
              <p className="text-white/55 text-sm">
                Te quedan <span className="text-brand-teal font-semibold">{trialDays} días</span> de acceso completo sin costo.
              </p>
            </div>
            <Link
              href="/dashboard/facturacion"
              className="relative z-10 flex items-center gap-2 text-sm font-sans font-semibold text-white px-5 py-2.5 rounded-xl transition-all whitespace-nowrap hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg, #6FA89E 0%, #5a9990 100%)" }}
            >
              Activar plan <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Citas hoy",
              value: String(stats.todayAppointments),
              icon: CalendarDays,
              color: "text-brand-navy",
              bg: "from-brand-navy/8 to-brand-navy/4",
              href: "/dashboard/agenda",
            },
            {
              label: "Clientes totales",
              value: String(stats.totalClients),
              icon: Users,
              color: "text-brand-teal",
              bg: "from-brand-teal/10 to-brand-teal/5",
              href: "/dashboard/clientes",
            },
            {
              label: "Ingresos del mes",
              value: `$${stats.monthlyRevenue.toLocaleString("es-CL")}`,
              icon: TrendingUp,
              color: "text-emerald-500",
              bg: "from-emerald-500/10 to-emerald-500/5",
              href: "/dashboard/ventas",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-brand relative overflow-hidden hover:-translate-y-0.5 transition-all group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} pointer-events-none`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.bg} border border-white shadow-sm`}>
                      <Icon size={18} className={stat.color} />
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-teal transition-colors" />
                  </div>
                  <p className="text-brand-navy font-sans font-bold text-2xl">{stat.value}</p>
                  <p className="text-slate-400 text-sm mt-0.5 font-body">{stat.label}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Setup + Public Page ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Setup checklist */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-brand-navy font-sans font-semibold text-base">Configuración inicial</h2>
              <span className="text-xs text-brand-teal font-sans font-semibold">{doneTasks}/{SETUP_ITEMS.length}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #0D1B2A, #6FA89E)" }}
              />
            </div>
            <div className="space-y-2.5">
              {SETUP_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={[
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    item.done ? "bg-brand-navy border-brand-navy" : "border-slate-300",
                  ].join(" ")}>
                    {item.done && <Check size={10} strokeWidth={3} className="text-white" />}
                  </div>
                  <span className={`text-sm font-body ${item.done ? "text-slate-400 line-through" : "text-brand-navy"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/ajustes"
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-sans font-semibold hover:bg-slate-50 transition-colors"
            >
              <CheckCircle2 size={14} />
              Completar configuración
            </Link>
          </div>

          {/* Columna derecha */}
          <div className="flex flex-col gap-4">
            <PublicPageCard slug={business.slug} />

            {/* Próximamente */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-brand-teal" />
                <h3 className="text-brand-navy font-sans font-semibold text-sm">Próximamente en Frandora</h3>
              </div>
              <div className="space-y-2">
                {COMING_SOON.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/60 flex-shrink-0" />
                    <span className="text-slate-500 text-xs font-body">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
