"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { FrandoraLogo } from "@/components/ui/FrandoraLogo";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, CalendarDays, Users, Sparkles,
  Receipt, BarChart3, Megaphone, Settings2,
  Zap, ChevronRight, Archive, PanelLeftClose, PanelLeftOpen,
  UserCog, X, Menu, LineChart, FileText, ClipboardList, Images,
  CreditCard, Package, Palette,
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
      { href: "/dashboard",            label: "Inicio",       icon: LayoutDashboard },
      { href: "/dashboard/agenda",     label: "Agenda",       icon: CalendarDays },
      { href: "/dashboard/clientes",   label: "Clientes",     icon: Users },
      { href: "/dashboard/equipo",     label: "Equipo",       icon: UserCog },
      { href: "/dashboard/servicios",  label: "Servicios",    icon: Sparkles },
      { href: "/dashboard/inventario", label: "Inventario",   icon: Archive },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { href: "/dashboard/ventas",      label: "Ventas & POS", icon: Receipt },
      { href: "/dashboard/facturacion", label: "Facturación",  icon: BarChart3 },
    ],
  },
  {
    title: "Clínica",
    items: [
      { href: "/dashboard/formularios",      label: "Formularios",     icon: FileText },
      { href: "/dashboard/fichas",           label: "Fichas Clínicas", icon: ClipboardList },
      { href: "/dashboard/galeria-clinica",  label: "Galería Clínica", icon: Images },
    ],
  },
  {
    title: "Fidelización",
    items: [
      { href: "/dashboard/membresias", label: "Membresías", icon: CreditCard },
      { href: "/dashboard/paquetes",   label: "Paquetes",   icon: Package },
    ],
  },
  {
    title: "Análisis",
    items: [
      { href: "/dashboard/reportes",  label: "Reportes",  icon: LineChart },
      { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
    ],
  },
  {
    title: "Config",
    items: [
      { href: "/dashboard/ajustes",                  label: "Ajustes",         icon: Settings2 },
      { href: "/dashboard/ajustes/personalizacion",  label: "Personalización", icon: Palette   },
    ],
  },
];

export function Sidebar() {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persistir estado colapso
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  // Cerrar mobile al navegar
  useEffect(() => { setMobileOpen(false); }, [path]);

  const w = collapsed ? "w-16" : "w-64";

  return (
    <>
      {/* ── Botón hamburger mobile ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-brand-navy text-white shadow-lg"
      >
        <Menu size={18} />
      </button>

      {/* ── Overlay mobile ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "h-screen flex flex-col transition-[width] duration-300 overflow-hidden shrink-0",
          "fixed top-0 left-0 z-50",
          "lg:sticky lg:top-0 lg:left-auto lg:z-30",
          w,
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        style={{
          background: "linear-gradient(175deg, #132539 0%, #0D1B2A 35%, #091520 100%)",
        }}
      >
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(111,168,158,0.18) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-20 left-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(111,168,158,0.08) 0%, transparent 70%)" }}
        />

        {/* ── Logo + botón cerrar/colapsar ── */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-4 border-b border-white/8 shrink-0">
          {!collapsed && (
            <Link href="/dashboard" className="block min-w-0">
              <FrandoraLogo size="sm" variant="light" showTagline />
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto block">
              <FrandoraLogo size="xs" variant="light" iconOnly />
            </Link>
          )}

          {/* Botón colapsar (desktop) */}
          <button
            onClick={toggleCollapse}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/35 hover:text-white hover:bg-white/8 transition-[background-color,color] duration-150 shrink-0"
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>

          {/* Botón cerrar mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-white/35 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Navegación ── */}
        <nav className="relative z-10 flex-1 px-2 py-4 space-y-5 overflow-y-auto scrollbar-none">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-sans font-semibold tracking-[0.18em] uppercase text-white/25">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.soon ? "#" : item.href}
                      title={collapsed ? item.label : undefined}
                      className={[
                        "group flex items-center gap-3 rounded-xl text-sm font-body transition-[background-color,color] duration-150 relative",
                        collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5",
                        isActive
                          ? "text-white"
                          : item.soon
                          ? "text-white/30 cursor-default pointer-events-none"
                          : "text-white/55 hover:text-white hover:bg-white/6",
                      ].join(" ")}
                      style={isActive ? {
                        background: "linear-gradient(135deg, rgba(111,168,158,0.22) 0%, rgba(111,168,158,0.08) 100%)",
                        boxShadow: "inset 0 0 0 1px rgba(111,168,158,0.25)",
                      } : {}}
                    >
                      {isActive && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-brand-teal" />
                      )}
                      <Icon
                        size={16}
                        className={isActive ? "text-brand-teal shrink-0" : item.soon ? "text-white/25 shrink-0" : "text-white/45 group-hover:text-white/70 transition-colors shrink-0"}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 leading-none truncate">{item.label}</span>
                          {item.soon && (
                            <span className="text-[9px] font-sans font-semibold px-1.5 py-0.5 rounded bg-brand-teal/15 text-brand-teal/70 tracking-wide">
                              Pronto
                            </span>
                          )}
                          {isActive && <ChevronRight size={12} className="text-brand-teal/50 shrink-0" />}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Plan / upgrade ── */}
        {!collapsed && (
          <div className="relative z-10 mx-2 mb-2 p-3 rounded-xl border border-brand-teal/20 shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(111,168,158,0.12) 0%, rgba(13,27,42,0.6) 100%)" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Zap size={12} className="text-brand-teal" />
              <span className="text-white text-xs font-sans font-semibold">Trial activo</span>
            </div>
            <p className="text-white/40 text-[10px] leading-relaxed mb-2">14 días gratis</p>
            <Link
              href="/dashboard/ajustes"
              className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-[11px] font-sans font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #6FA89E 0%, #5a9990 100%)" }}
            >
              Ver planes <ChevronRight size={10} />
            </Link>
          </div>
        )}

        {/* ── Usuario ── */}
        <div className={`relative z-10 px-3 py-3 border-t border-white/8 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-1 ring-brand-teal/30" } }} />
          ) : (
            <div className="flex items-center gap-3">
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-1 ring-brand-teal/30" } }} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-sans font-medium truncate">Mi cuenta</p>
                <p className="text-white/35 text-[10px] font-body">Propietario</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
