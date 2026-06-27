"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Building2, ToggleRight, Megaphone, LifeBuoy,
  ChevronRight, ShieldCheck, X, Menu, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  soon?: boolean;
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Plataforma",
    items: [
      { href: "/admin",          label: "Financiero", icon: LayoutDashboard },
      { href: "/admin/negocios", label: "Negocios",   icon: Building2 },
    ],
  },
  {
    title: "Operación",
    items: [
      { href: "/admin/feature-flags",  label: "Feature Flags",  icon: ToggleRight },
      { href: "/admin/comunicaciones", label: "Comunicaciones", icon: Megaphone },
      { href: "/admin/soporte",        label: "Soporte",        icon: LifeBuoy },
    ],
  },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("admin-sidebar-collapsed", String(next));
  }

  useEffect(() => { setMobileOpen(false); }, [path]);

  const w = collapsed ? "w-16" : "w-64";

  return (
    <>
      {/* ── Botón hamburger mobile ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-brand-navy text-white shadow-lg"
        aria-label="Abrir menú"
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

        {/* ── Logo admin + colapsar ── */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-4 border-b border-white/8 shrink-0">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-teal/15 ring-1 ring-brand-teal/30 shrink-0">
                <ShieldCheck size={18} className="text-brand-teal" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-sans font-semibold text-sm leading-tight truncate">Frandora</p>
                <p className="text-brand-teal/70 text-[10px] font-sans font-semibold tracking-[0.18em] uppercase">Super Admin</p>
              </div>
            </Link>
          ) : (
            <Link href="/admin" className="mx-auto flex items-center justify-center w-9 h-9 rounded-xl bg-brand-teal/15 ring-1 ring-brand-teal/30">
              <ShieldCheck size={18} className="text-brand-teal" />
            </Link>
          )}

          <button
            onClick={toggleCollapse}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/35 hover:text-white hover:bg-white/8 transition-[background-color,color] duration-150 shrink-0"
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-white/35 hover:text-white"
            aria-label="Cerrar menú"
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
                  const isActive = path === item.href || (item.href !== "/admin" && path.startsWith(item.href));
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

        {/* ── Usuario ── */}
        <div className={`relative z-10 px-3 py-3 border-t border-white/8 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-1 ring-brand-teal/30" } }} />
          ) : (
            <div className="flex items-center gap-3">
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-1 ring-brand-teal/30" } }} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-sans font-medium truncate">{adminName}</p>
                <p className="text-white/35 text-[10px] font-body">Super Admin</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
