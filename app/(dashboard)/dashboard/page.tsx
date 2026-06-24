import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import Link from "next/link";

export const metadata = { title: "Dashboard | Frandora" };

const SETUP_ITEMS = [
  { label: "Completa tu perfil de negocio", href: "/dashboard/ajustes", done: true },
  { label: "Agrega tu foto de portada", href: "/dashboard/ajustes", done: false },
  { label: "Configura tus horarios",    href: "/dashboard/ajustes", done: true },
  { label: "Conecta tus redes sociales", href: "/dashboard/ajustes", done: false },
  { label: "Comparte tu página pública", href: "#", done: false },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { ownedBusinesses: { include: { subscription: true } } },
  });

  if (!user || user.ownedBusinesses.length === 0) redirect("/onboarding");

  const business = user.ownedBusinesses[0];
  const sub = business.subscription;
  const trialDays = sub?.trialEndsAt
    ? Math.max(0, Math.ceil((sub.trialEndsAt.getTime() - Date.now()) / 86400000))
    : 14;

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-brand-teal text-xs tracking-[0.2em] uppercase font-sans mb-1">Bienvenido</p>
        <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl">{business.name}</h1>
        <p className="text-slate-400 text-sm mt-1">Tu negocio está listo. Empieza a recibir reservas.</p>
      </div>

      {/* Trial banner */}
      {sub?.status === "TRIALING" && (
        <div className="mb-8 p-5 rounded-2xl bg-brand-navy text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-sans font-semibold">🎉 Tu prueba gratuita está activa</p>
            <p className="text-white/60 text-sm mt-0.5">
              Te quedan <strong className="text-brand-teal">{trialDays} días</strong> de prueba sin costo.
            </p>
          </div>
          <Link href="/dashboard/ajustes/plan" className="btn-teal text-sm px-5 py-2.5 whitespace-nowrap">
            Ver planes
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Citas hoy",       value: "0", icon: "📅" },
          { label: "Clientes totales", value: "0", icon: "👥" },
          { label: "Ingresos del mes", value: "$0", icon: "💰" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-brand border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-brand-navy font-sans font-bold text-2xl">{stat.value}</p>
            <p className="text-slate-400 text-sm mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Setup checklist */}
      <div className="bg-white rounded-2xl shadow-brand border border-slate-100 p-6">
        <h2 className="text-brand-navy font-sans font-semibold text-lg mb-4">Completa tu configuración</h2>
        <div className="space-y-3">
          {SETUP_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-navy/4 transition-colors group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.done ? "bg-brand-navy border-brand-navy" : "border-slate-300 group-hover:border-brand-navy/40"}`}>
                {item.done && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-sm ${item.done ? "text-slate-400 line-through" : "text-brand-navy"}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Public page link */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-2">Tu página pública de reservas:</p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-navy/5 border border-brand-navy/10">
            <span className="text-brand-teal text-sm font-sans font-medium truncate">
              {business.slug}.frandora.cl
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
