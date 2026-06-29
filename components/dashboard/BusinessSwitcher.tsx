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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (businesses.length <= 1) {
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={businessName ?? "Logo"} className="w-9 h-9 rounded-xl object-contain bg-white/10 p-0.5 shrink-0" />
        ) : (
          <Building2 size={20} className="text-brand-teal shrink-0" />
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
    <div ref={ref} className="relative min-w-0 flex-1">
      <button
        onClick={() => setOpen((v) => !v)}
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
        <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden"
          style={{ background: "linear-gradient(160deg, #1a2f45 0%, #0D1B2A 100%)" }}
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-white/30">
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
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-colors duration-100
                  ${isCurrent ? "bg-brand-teal/10" : "hover:bg-white/6"}
                  ${isLoading ? "opacity-60" : ""}`}
              >
                {biz.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={biz.logoUrl} alt={biz.name} className="w-7 h-7 rounded-lg object-contain bg-white/10 p-0.5 shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                    <Building2 size={12} className="text-brand-teal" />
                  </div>
                )}
                <span className={`flex-1 text-sm font-body truncate ${isCurrent ? "text-white font-semibold" : "text-white/70"}`}>
                  {isLoading ? "Cambiando..." : biz.name}
                </span>
                {isCurrent && <Check size={12} className="text-brand-teal shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
