"use client";

import { useState } from "react";
import { Megaphone, Bell, Tag, Gift, Star, Award } from "lucide-react";
import { AutomaticsPanel } from "@/components/dashboard/marketing/AutomaticsPanel";
import { CouponsPanel } from "@/components/dashboard/marketing/CouponsPanel";
import { GiftCardsPanel } from "@/components/dashboard/marketing/GiftCardsPanel";
import { ReviewsPanel } from "@/components/dashboard/marketing/ReviewsPanel";
import { LoyaltyPanel } from "@/components/dashboard/marketing/LoyaltyPanel";

const TABS = [
  { id: "automaticos", label: "Avisos automáticos", icon: Bell },
  { id: "cupones",     label: "Cupones",            icon: Tag },
  { id: "gift-cards",  label: "Tarjetas de regalo", icon: Gift },
  { id: "resenas",     label: "Opiniones",          icon: Star },
  { id: "puntos",      label: "Programa de puntos", icon: Award },
] as const;

type TabId = typeof TABS[number]["id"];

export default function MarketingPage() {
  const [tab, setTab] = useState<TabId>("automaticos");

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-0.5">
            <Megaphone size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">Comunicaciones</p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">Marketing y avisos</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Mantén a tus clientes informados y hazlos volver sin esfuerzo.
          </p>
        </div>

        {/* Tabs — scroll horizontal en mobile */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-max md:w-full">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={[
                    "flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs md:text-sm font-sans font-semibold transition-all whitespace-nowrap",
                    tab === t.id ? "bg-white text-brand-navy shadow-sm" : "text-slate-500 hover:text-brand-navy",
                  ].join(" ")}>
                  <Icon size={14} />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido del tab activo */}
        {tab === "automaticos" && <AutomaticsPanel />}
        {tab === "cupones"     && <CouponsPanel />}
        {tab === "gift-cards"  && <GiftCardsPanel />}
        {tab === "resenas"     && <ReviewsPanel />}
        {tab === "puntos"      && <LoyaltyPanel />}
      </div>
    </div>
  );
}
