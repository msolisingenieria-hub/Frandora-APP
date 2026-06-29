"use client";

import { useState, useRef, useEffect } from "react";
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

  function openDropdown() {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 224) });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleScroll() { setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  if (businesses.length <= 1) {
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={businessName ?? "Logo"} className="w-9 h-9 rounded-xl object-contain bg-white/10 p-0.5 shrink-0" />
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

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
            background: "#0f2035",
            border: "1px solid rgba(111,168,158,0.2)",
            borderRadius: "14px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          <p className="px-3 pt-3 pb-1.5 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-white/40">
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
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors duration-100 last:rounded-b-[14px]
                  ${isCurrent ? "bg-brand-teal/15" : "hover:bg-white/8"}
                  ${isLoading ? "opacity-60" : ""}`}
              >
                {biz.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={biz.logoUrl} alt={biz.name} className="w-7 h-7 rounded-lg object-contain bg-white/10 p-0.5 shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                    <Building2 size={12} className="text-brand-teal/70" />
                  </div>
                )}
                <span className={`flex-1 text-sm font-body truncate ${isCurrent ? "text-white font-semibold" : "text-white/65 hover:text-white"}`}>
                  {isLoading ? "Cambiando..." : biz.name}
                </span>
                {isCurrent && <Check size={13} className="text-brand-teal shrink-0" />}
              </button>
            );
          })}
          <div className="h-1.5 rounded-b-[14px]" />
        </div>
      )}
    </>
  );
}
