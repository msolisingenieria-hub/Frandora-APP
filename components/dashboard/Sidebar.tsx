"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FrandoraLogo } from "@/components/ui/FrandoraLogo";
import {
  LayoutDashboard, CalendarDays, Users, Sparkles,
  Receipt, BarChart3, Megaphone, Settings2,
  Zap, ChevronRight, Archive,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  soon?: boolean;
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Gestión",
    items: [
      { href: "/dashboard",            label: "Inicio",      icon: LayoutDashboard },
      { href: "/dashboard/agenda",     label: "Agenda",      icon: CalendarDays },
      { href: "/dashboard/clientes",   label: "Clientes",    icon: Users },
      { href: "/dashboard/servicios",  label: "Servicios",   icon: Sparkles },
      { href: "/dashboard/inventario", label: "Inventario",  icon: Archive },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { href: "/dashboard/ventas",       label: "Ventas & POS",  icon: Receipt },
      { href: "/dashboard/facturacion", label: "Facturación",  icon: BarChart3 },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/dashboard/marketing", label: "Campañas",   icon: Megaphone, soon: true },
      { href: "/dashboard/ajustes",   label: "Ajustes",    icon: Settings2 },
    ],
  },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(175deg, #132539 0%, #0D1B2A 35%, #091520 100%)",
      }}
    >
      {/* Glow decorativo teal superior */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(111,168,158,0.18) 0%, transparent 70%)" }}
      />
      {/* Glow sutil inferior */}
      <div className="absolute bottom-20 left-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(111,168,158,0.08) 0%, transparent 70%)" }}
      />

      {/* ── Logo ── */}
      <div className="relative z-10 px-5 pt-6 pb-5 border-b border-white/8">
        <Link href="/dashboard" className="block">
          <FrandoraLogo size="sm" variant="light" showTagline />
        </Link>
      </div>

      {/* ── Navegación ── */}
      <nav className="relative z-10 flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-[10px] font-sans font-semibold tracking-[0.18em] uppercase text-white/25">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = path === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-200 relative",
                      isActive
                        ? "text-white"
                        : item.soon
                        ? "text-white/35 cursor-default pointer-events-none"
                        : "text-white/55 hover:text-white hover:bg-white/6",
                    ].join(" ")}
                    style={isActive ? {
                      background: "linear-gradient(135deg, rgba(111,168,158,0.22) 0%, rgba(111,168,158,0.08) 100%)",
                      boxShadow: "inset 0 0 0 1px rgba(111,168,158,0.25)",
                    } : {}}
                  >
                    {/* Left accent bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-brand-teal" />
                    )}
                    <Icon
                      size={16}
                      className={isActive ? "text-brand-teal" : item.soon ? "text-white/25" : "text-white/45 group-hover:text-white/70 transition-colors"}
                    />
                    <span className="flex-1 leading-none">{item.label}</span>
                    {item.soon && (
                      <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded bg-brand-teal/15 text-brand-teal/70 tracking-wide">
                        Pronto
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight size={12} className="text-brand-teal/50" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Plan / upgrade ── */}
      <div className="relative z-10 mx-3 mb-3 p-3 rounded-xl border border-brand-teal/20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(111,168,158,0.12) 0%, rgba(13,27,42,0.6) 100%)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap size={13} className="text-brand-teal" />
          <span className="text-white text-xs font-sans font-semibold">Trial activo</span>
        </div>
        <p className="text-white/45 text-[10px] leading-relaxed mb-2.5">
          14 días gratis · Sin tarjeta de crédito
        </p>
        <Link
          href="/dashboard/ajustes"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] font-sans font-semibold text-white transition-all duration-200"
          style={{ background: "linear-gradient(135deg, #6FA89E 0%, #5a9990 100%)" }}
        >
          Ver planes
          <ChevronRight size={11} />
        </Link>
      </div>

      {/* ── Usuario ── */}
      <div className="relative z-10 px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-1 ring-brand-teal/30" } }} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-sans font-medium truncate">Mi cuenta</p>
            <p className="text-white/35 text-[10px] font-body">Propietario</p>
          </div>
          <Settings2 size={14} className="text-white/25 hover:text-white/60 transition-colors cursor-pointer flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
