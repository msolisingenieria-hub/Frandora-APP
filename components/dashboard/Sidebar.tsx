"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/dashboard",           label: "Inicio",       icon: "⊞" },
  { href: "/dashboard/agenda",    label: "Agenda",       icon: "📅", soon: true },
  { href: "/dashboard/clientes",  label: "Clientes",     icon: "👥", soon: true },
  { href: "/dashboard/servicios", label: "Servicios",    icon: "✦",  soon: true },
  { href: "/dashboard/ventas",    label: "Ventas",       icon: "💳", soon: true },
  { href: "/dashboard/marketing", label: "Marketing",    icon: "📣", soon: true },
  { href: "/dashboard/reportes",  label: "Reportes",     icon: "📊", soon: true },
  { href: "/dashboard/ajustes",   label: "Ajustes",      icon: "⚙",  soon: true },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-brand-navy flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-white font-sans font-bold text-xl">Frandora</span>
        <p className="text-brand-teal/60 text-[10px] tracking-[0.2em] uppercase mt-0.5">Panel del negocio</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon, soon }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-150",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:text-white hover:bg-white/6",
              ].join(" ")}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span>{label}</span>
              {soon && (
                <span className="ml-auto text-[9px] bg-brand-teal/20 text-brand-teal px-1.5 py-0.5 rounded font-sans uppercase tracking-wide">
                  Pronto
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-5 border-t border-white/10">
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-sans font-medium truncate">Mi cuenta</p>
            <p className="text-white/40 text-[10px]">Trial · 14 días</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
