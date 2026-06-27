"use client";

import Image from "next/image";
import { Clock, ChevronRight } from "lucide-react";
import type { PublicServiceFull } from "@/types/public-page";
import { formatPrice, formatDuration } from "@/types/booking";

type Props = {
  services: PublicServiceFull[];
  currency: string;
  layout: string; // "grid" | "list"
  onBook: (serviceId: string) => void;
};

function ServiceCard({
  service,
  currency,
  layout,
  onBook,
}: {
  service: PublicServiceFull;
  currency: string;
  layout: string;
  onBook: (id: string) => void;
}) {
  if (layout === "list") {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-brand-sm
        hover:shadow-brand hover:-translate-y-0.5 transition-all duration-200 ease-out">
        {service.imageUrl && (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
            <Image src={service.imageUrl} alt={service.name} fill className="object-cover" sizes="64px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {service.categoryName && (
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-teal mb-0.5 block">
              {service.categoryName}
            </span>
          )}
          <h3 className="font-sans font-semibold text-brand-navy text-sm">{service.name}</h3>
          {service.description && (
            <p className="font-body text-slate-500 text-xs mt-0.5 line-clamp-1">{service.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs font-body text-slate-400">
              <Clock size={11} /> {formatDuration(service.duration)}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-sans font-bold text-brand-navy text-base">{formatPrice(service.price, currency)}</p>
          <button
            onClick={() => onBook(service.id)}
            className="mt-1 flex items-center gap-1 text-xs font-sans font-semibold cursor-pointer
              transition-colors duration-150 hover:brightness-90 active:scale-[0.97]"
            style={{ color: "var(--biz-primary, #0D1B2A)" }}
          >
            Reservar <ChevronRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand-sm overflow-hidden
      hover:shadow-brand hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col">
      {service.imageUrl ? (
        <div className="relative h-40 w-full">
          <Image src={service.imageUrl} alt={service.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      ) : (
        <div className="h-3 w-full" style={{ background: service.color }} />
      )}
      <div className="p-4 flex flex-col flex-1">
        {service.categoryName && (
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-teal mb-1">
            {service.categoryName}
          </span>
        )}
        <h3 className="font-sans font-semibold text-brand-navy text-sm mb-1">{service.name}</h3>
        {service.description && (
          <p className="font-body text-slate-500 text-xs mb-2 line-clamp-2 flex-1">{service.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <div>
            <p className="font-sans font-bold text-brand-navy text-base">{formatPrice(service.price, currency)}</p>
            <span className="flex items-center gap-1 text-xs font-body text-slate-400">
              <Clock size={11} /> {formatDuration(service.duration)}
            </span>
          </div>
          <button
            onClick={() => onBook(service.id)}
            className="px-4 py-2 rounded-xl font-sans font-semibold text-xs text-white
              transition-all duration-150 ease-out active:scale-[0.97] cursor-pointer hover:brightness-90"
            style={{ background: "var(--biz-primary, #0D1B2A)" }}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}

export function PublicServices({ services, currency, layout, onBook }: Props) {
  if (services.length === 0) return null;

  return (
    <section id="servicios" className="px-4 md:px-10 py-8 md:py-10">
      <h2 className="font-sans font-bold text-brand-navy text-xl md:text-2xl mb-5">Servicios</h2>
      <div className={layout === "list"
        ? "flex flex-col gap-3"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      }>
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} currency={currency} layout={layout} onBook={onBook} />
        ))}
      </div>
    </section>
  );
}
