"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { switchBusinessAction } from "@/lib/actions/switch-business";
import type { UserBusiness } from "@/lib/auth/business";

type Props = {
  businesses: UserBusiness[];
  currentId: string;
  businessName?: string;
  logoUrl?: string | null;
};

export function BusinessSwitcher({ businesses, currentId, businessName, logoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 224 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function openDropdown() {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 220) });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    function handleScroll() { setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  if (businesses.length <= 1) {
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={businessName ?? "Logo"} className="w-8 h-8 rounded-xl object-contain bg-white/10 p-0.5 shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-brand-teal/20 flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-brand-teal" />
          </div>
        )}
        <span className="text-white font-sans font-semibold text-sm truncate">{businessName ?? "Mi negocio"}</span>
      </div>
    );
  }

  async function handleSwitch(id: string) {
    if (id === currentId) { setOpen(false); return; }
    setPending(id);
    await switchBusinessAction(id);
    setPending(null);
    setOpen(false);
  }

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 99999,
        backgroundColor: "#0c1e30",
        border: "1px solid rgba(111,168,158,0.25)",
        borderRadius: "14px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <p style={{ padding: "12px 12px 6px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
        Mis negocios
      </p>
      {businesses.map((biz) => {
        const isCurrent = biz.id === currentId;
        const isLoading = pending === biz.id;
        return (
          <button
            key={biz.id}
            onClick={() => handleSwitch(biz.id)}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 12px",
              textAlign: "left",
              background: isCurrent ? "rgba(111,168,158,0.15)" : "transparent",
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "default" : "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {biz.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={biz.logoUrl} alt={biz.name} style={{ width: 28, height: 28, borderRadius: 8, objectFit: "contain", background: "rgba(255,255,255,0.1)", padding: 2, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(111,168,158,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 size={12} color="#6FA89E" />
              </div>
            )}
            <span style={{ flex: 1, fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? "#ffffff" : "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isLoading ? "Cambiando..." : biz.name}
            </span>
            {isCurrent && <Check size={13} color="#6FA89E" style={{ flexShrink: 0 }} />}
          </button>
        );
      })}
      <div style={{ height: 6 }} />
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={openDropdown}
        className="flex items-center gap-2 w-full min-w-0 group"
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={businessName ?? "Logo"} className="w-8 h-8 rounded-xl object-contain bg-white/10 p-0.5 shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-brand-teal/20 flex items-center justify-center shrink-0">
            <Building2 size={14} className="text-brand-teal" />
          </div>
        )}
        <span className="text-white font-sans font-semibold text-sm truncate flex-1 text-left">
          {businessName ?? "Mi negocio"}
        </span>
        <ChevronDown
          size={13}
          className={`text-white/40 group-hover:text-white/70 transition-[transform,color] duration-150 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {mounted && open && createPortal(dropdown, document.body)}
    </>
  );
}
