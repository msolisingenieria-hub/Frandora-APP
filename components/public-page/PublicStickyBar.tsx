"use client";

import { Star } from "lucide-react";

type Props = {
  businessName: string;
  rating: number;
  totalReviews: number;
  onBook: () => void;
};

export function PublicStickyBar({ businessName, rating, totalReviews, onBook }: Props) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden
      bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3
      flex items-center justify-between gap-3
      shadow-[0_-4px_24px_rgba(13,27,42,0.12)]
      translate-y-0 motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300">
      <div className="min-w-0">
        <p className="font-sans font-semibold text-brand-navy text-sm truncate">{businessName}</p>
        {totalReviews > 0 && (
          <div className="flex items-center gap-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="font-body text-slate-500 text-xs">{rating.toFixed(1)} ({totalReviews})</span>
          </div>
        )}
      </div>

      <button
        onClick={onBook}
        className="shrink-0 px-6 py-2.5 rounded-xl font-sans font-semibold text-sm text-white
          transition-all duration-150 ease-out active:scale-[0.97] cursor-pointer hover:brightness-90 whitespace-nowrap"
        style={{ background: "var(--biz-primary, #0D1B2A)" }}
      >
        Reservar ahora
      </button>
    </div>
  );
}
