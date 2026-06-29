"use client";

import Image from "next/image";
import { Star, MapPin, Phone } from "lucide-react";
import type { PublicPageData } from "@/types/public-page";
import { SocialLinks } from "./SocialLinks";

type Props = {
  data: Pick<PublicPageData, "name" | "description" | "logoUrl" | "coverUrl" | "city" | "phone" | "ratingStats" | "socials" | "customization">;
  onBook: () => void;
};

function StarRating({ average, total }: { average: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={14}
            className={n <= Math.round(average) ? "fill-amber-400 text-amber-400" : "text-slate-300 fill-slate-300"}
          />
        ))}
      </div>
      {total > 0 && (
        <span className="text-sm font-body text-white/80">
          {average.toFixed(1)} ({total} reseñas)
        </span>
      )}
    </div>
  );
}

export function PublicHero({ data, onBook }: Props) {
  const { name, description, logoUrl, coverUrl, city, phone, ratingStats, socials, customization } = data;
  const hasVideo = !!customization.heroVideoUrl;
  const hasCover = !!coverUrl || !!customization.heroImageUrl;
  const coverSrc = customization.heroImageUrl ?? coverUrl;

  return (
    <section className="relative min-h-[420px] md:min-h-[520px] flex items-end overflow-hidden">
      {/* Fondo */}
      {hasVideo ? (
        <video
          src={customization.heroVideoUrl!}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : hasCover ? (
        <Image
          src={coverSrc!}
          alt={`${name} — foto de portada`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-navy/80" />
      )}

      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Contenido */}
      <div className="relative z-10 w-full px-4 pb-8 pt-20 md:px-10 md:pb-12">
        <div className="max-w-4xl">
          {/* Logo */}
          {logoUrl && (
            <div className="mb-4 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={`Logo ${name}`} className="object-cover w-full h-full" />
            </div>
          )}

          {/* Nombre */}
          <h1 className="font-sans font-bold text-white text-3xl md:text-5xl leading-tight mb-2">
            {customization.heroTitle ?? name}
          </h1>

          {/* Descripción */}
          {(customization.heroSubtitle ?? description) && (
            <p className="font-body text-white/80 text-base md:text-lg mb-3 max-w-xl line-clamp-2">
              {customization.heroSubtitle ?? description}
            </p>
          )}

          {/* Rating */}
          {ratingStats.total > 0 && (
            <div className="mb-3">
              <StarRating average={ratingStats.average} total={ratingStats.total} />
            </div>
          )}

          {/* Ciudad / teléfono */}
          <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm font-body mb-5">
            {city && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {city}
              </span>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <Phone size={13} /> {phone}
              </a>
            )}
          </div>

          {/* CTA + redes sociales */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onBook}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-sans font-semibold text-base
                text-white shadow-lg transition-[transform,filter] duration-150 ease-out
                active:scale-[0.97] cursor-pointer hover:brightness-110"
              style={{ background: "var(--biz-primary, #0D1B2A)" }}
            >
              Reservar ahora
            </button>
            <SocialLinks socials={socials} variant="light" />
          </div>
        </div>
      </div>
    </section>
  );
}
