import Image from "next/image";
import type { PublicBusiness } from "@/types/booking";
import { MapPin, Phone, Star, CalendarCheck } from "lucide-react";

type Props = {
  business: PublicBusiness;
};

export function BookingHeader({ business }: Props) {
  return (
    <div className="relative overflow-hidden">
      {/* Hero cover */}
      <div
        className="h-52 md:h-64 w-full relative"
        style={
          business.coverUrl
            ? {
                backgroundImage: `url(${business.coverUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background:
                  "linear-gradient(135deg, #0D1B2A 0%, #12263f 40%, #0f3030 70%, #0a1f1c 100%)",
              }
        }
      >
        {/* Mesh overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/75" />

        {/* Decorative texture dots */}
        {!business.coverUrl && (
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        )}

        {/* CTA badge — top right */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 bg-[#6FA89E]/20 backdrop-blur-sm border border-[#6FA89E]/40 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6FA89E] animate-pulse" />
            <span className="text-[#CFE3DF] text-xs font-medium">Reserva disponible</span>
          </div>
        </div>
      </div>

      {/* Business card — overlapping hero */}
      <div className="relative z-10 max-w-lg mx-auto px-4 md:px-6 -mt-16 pb-4">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(13,27,42,0.15)] border border-slate-100 p-5">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-slate-100 shadow-md flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3347 100%)" }}
            >
              {business.logoUrl ? (
                <Image
                  src={business.logoUrl}
                  alt={business.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl md:text-3xl">
                  {business.name[0]}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[#0D1B2A] text-lg md:text-xl font-bold leading-tight">
                {business.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                {business.city && (
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <MapPin size={11} className="text-[#6FA89E]" />
                    {business.city}
                  </span>
                )}
                {business.phone && (
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <Phone size={11} className="text-[#6FA89E]" />
                    {business.phone}
                  </span>
                )}
              </div>

              {/* Rating placeholder */}
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-slate-400 ml-1">Reserva online</span>
              </div>
            </div>
          </div>

          {business.description && (
            <p className="mt-3 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-3">
              {business.description}
            </p>
          )}

          {/* CTA strip */}
          <div className="mt-3 flex items-center gap-2 bg-[#F2F4F6] rounded-xl px-4 py-2.5">
            <CalendarCheck size={15} className="text-[#6FA89E] shrink-0" />
            <p className="text-xs text-[#0D1B2A] font-medium">
              Agenda tu cita en minutos — sin llamadas, sin esperas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
