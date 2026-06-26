import Image from "next/image";
import type { PublicBusiness } from "@/types/booking";
import { MapPin, Phone } from "lucide-react";

type Props = {
  business: PublicBusiness;
};

export function BookingHeader({ business }: Props) {
  return (
    <div className="relative overflow-hidden">
      {/* Cover background */}
      <div
        className="h-36 md:h-48 w-full"
        style={
          business.coverUrl
            ? { backgroundImage: `url(${business.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(135deg, #0D1B2A 0%, #162d43 60%, #1a4040 100%)" }
        }
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      </div>

      {/* Business info */}
      <div className="relative z-10 px-4 md:px-8 pb-4 -mt-12">
        <div className="flex items-end gap-4">
          {/* Logo / Avatar */}
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white shadow-brand-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
          >
            {business.logoUrl ? (
              <Image src={business.logoUrl} alt={business.name} width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-sans font-bold text-3xl">
                {business.name[0]}
              </span>
            )}
          </div>

          {/* Name and meta */}
          <div className="pb-1 flex-1 min-w-0">
            <h1 className="text-white text-xl md:text-2xl font-sans font-bold truncate drop-shadow-lg">
              {business.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {business.city && (
                <span className="flex items-center gap-1 text-white/80 text-xs">
                  <MapPin size={12} /> {business.city}
                </span>
              )}
              {business.phone && (
                <span className="flex items-center gap-1 text-white/80 text-xs">
                  <Phone size={12} /> {business.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {business.description && (
          <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-xl">
            {business.description}
          </p>
        )}
      </div>
    </div>
  );
}
