"use client";

import { Star } from "lucide-react";
import type { PublicReview, PublicRatingStats } from "@/types/public-page";

type Props = {
  reviews: PublicReview[];
  stats: PublicRatingStats;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </div>
  );
}

function RatingBar({ count, total, label }: { count: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-body text-xs text-slate-500 w-3 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: "var(--biz-secondary, #6FA89E)" }}
        />
      </div>
      <span className="font-body text-xs text-slate-400 w-7 text-right shrink-0">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  const date = new Date(review.createdAt).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
  });
  const initials = review.clientName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-mist flex items-center justify-center text-brand-navy font-sans font-semibold text-xs shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-sans font-semibold text-brand-navy text-sm leading-none">{review.clientName}</p>
            <p className="font-body text-slate-400 text-[11px] mt-0.5">{date}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      {review.comment && (
        <p className="font-body text-slate-600 text-sm leading-relaxed line-clamp-3">{review.comment}</p>
      )}
    </div>
  );
}

export function PublicReviews({ reviews, stats }: Props) {
  if (reviews.length === 0) return null;

  return (
    <section id="resenas" className="px-4 md:px-10 py-8 md:py-10">
      <h2 className="font-sans font-bold text-brand-navy text-xl md:text-2xl mb-5">Reseñas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen de rating */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-brand-sm p-6 flex flex-col gap-4">
          <div className="text-center">
            <p className="font-sans font-bold text-brand-navy text-5xl leading-none">{stats.average.toFixed(1)}</p>
            <div className="flex justify-center mt-2 mb-1">
              <Stars rating={Math.round(stats.average)} />
            </div>
            <p className="font-body text-slate-400 text-sm">{stats.total} reseñas</p>
          </div>
          <div className="flex flex-col gap-2">
            {([5, 4, 3, 2, 1] as const).map((n) => (
              <RatingBar key={n} count={stats.distribution[n]} total={stats.total} label={String(n)} />
            ))}
          </div>
        </div>

        {/* Grid de reseñas */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          {reviews.slice(0, 6).map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
