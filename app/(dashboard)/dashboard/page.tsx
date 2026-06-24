import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { CalendarDays, Users, TrendingUp, ArrowRight, Sparkles, Clock } from "lucide-react";
import { PublicPageCard } from "@/components/dashboard/PublicPageCard";

export const metadata = { title: "Dashboard | Frandora" };

const SETUP_ITEMS = [
  { label: "Negocio configurado",        done: true  },
  { label: "Servicios agregados",        done: true  },
  { label: "Horarios definidos",         done: true  },
  { label: "Foto de portada",            done: false },
  { label: "Conectar redes sociales",    done: false },
  { label: "Compartir página pública",   done: false },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      ownedBusinesses: {
        include: {
          subscription: { include: { plan: true } },
          _count: { select: { clients: true, appointments: true } },
        },
      },
    },
  });

  if (!user || user.ownedBusinesses.length === 0) redirect("/onboarding");

  const business = user.ownedBusinesses[0];
  const sub = business.subscription;
  const trialDays = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - Date.now()) / 86400000))
    : 14;
  const doneTasks = SETUP_ITEMS.filter((i) => i.done).length;
  const progress = Math.round((doneTasks / SETUP_ITEMS.length) * 100);

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
        {sub?.status === "TRIALING" && (
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
              href="/dashboard/ajustes"
              className="relative z-10 flex items-center gap-2 text-sm font-sans font-semibold text-white px-5 py-2.5 rounded-xl transition-all whitespace-nowrap"
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
              value: "0",
              icon: CalendarDays,
              color: "text-brand-navy",
              bg: "from-brand-navy/8 to-brand-navy/4",
            },
            {
              label: "Clientes totales",
              value: String(business._count.clients),
              icon: Users,
              color: "text-brand-teal",
              bg: "from-brand-teal/10 to-brand-teal/5",
            },
            {
              label: "Ingresos del mes",
              value: "$0",
              icon: TrendingUp,
              color: "text-emerald-500",
              bg: "from-emerald-500/10 to-emerald-500/5",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-brand relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} pointer-events-none`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.bg} border border-white shadow-sm`}>
                      <Icon size={18} className={stat.color} />
                    </div>
                  </div>
                  <p className="text-brand-navy font-sans font-bold text-2xl">{stat.value}</p>
                  <p className="text-slate-400 text-sm mt-0.5 font-body">{stat.label}</p>
                </div>
              </div>
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
            {/* Progress bar */}
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
                    {item.done && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={`text-sm font-body ${item.done ? "text-slate-400 line-through" : "text-brand-navy"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Public page + quick actions */}
          <div className="flex flex-col gap-4">
            {/* Página pública */}
            <PublicPageCard slug={business.slug} />

            {/* Próximas funciones */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-brand-teal" />
                <h3 className="text-brand-navy font-sans font-semibold text-sm">Próximamente</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Pagos con Flow.cl",        done: false },
                  { label: "POS e inventario",          done: false },
                  { label: "Marketing y recordatorios", done: false },
                  { label: "Reportes y analytics",      done: false },
                ].map((feat) => (
                  <div key={feat.label} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/60 flex-shrink-0" />
                    <span className="text-slate-500 text-xs font-body">{feat.label}</span>
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
