"use client";

import Image from "next/image";
import type { BookingResult, PublicService } from "@/types/booking";
import { formatPrice, formatDuration } from "@/types/booking";
import { CheckCircle, Calendar, Clock, User, Copy } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Props = {
  result: BookingResult;
  businessName: string;
  service?: PublicService | null;
  currency?: string;
  onNewBooking: () => void;
};

export function BookingConfirmation({ result, businessName, service, currency = "CLP", onNewBooking }: Props) {
  const start = new Date(result.startTime);
  const end   = new Date(result.endTime);

  const copyCode = () => {
    navigator.clipboard.writeText(result.bookingCode);
  };

  return (
    <div className="p-4 md:p-8 flex flex-col items-center text-center">
      {/* Checkmark premium */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}>
          <CheckCircle size={36} className="text-brand-teal" />
        </div>
        <div className="absolute -inset-2 rounded-full border-2 border-brand-teal/20 animate-ping" />
      </div>

      <h2 className="font-sans font-bold text-brand-navy text-2xl mb-2">
        ¡Reserva confirmada!
      </h2>
      <p className="text-slate-500 text-sm max-w-xs">
        Tu cita en <span className="font-semibold text-brand-navy">{businessName}</span> ha sido reservada exitosamente.
      </p>

      {/* Resumen del servicio */}
      {service && (
        <div className="mt-6 w-full max-w-xs flex items-center gap-3 p-3 bg-brand-mist/30 border border-brand-mist rounded-2xl text-left">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
            {service.imageUrl ? (
              <Image src={service.imageUrl} alt={service.name} fill className="object-cover" sizes="48px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}99)` }}>
                <span className="font-bold text-white/90">{service.name[0]}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-brand-navy text-sm truncate">{service.name}</p>
            <p className="text-slate-500 text-xs">{formatDuration(service.duration)}</p>
          </div>
          <span className="font-sans font-bold text-brand-navy text-sm tabular-nums">
            {formatPrice(service.price, currency)}
          </span>
        </div>
      )}

      {/* Código de reserva */}
      <div className="my-6 w-full max-w-xs">
        <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider font-sans font-semibold">
          Código de reserva
        </p>
        <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3">
          <span className="flex-1 font-mono text-brand-navy font-bold tracking-wider text-sm">
            {result.bookingCode.slice(0, 8).toUpperCase()}
          </span>
          <button onClick={copyCode} className="text-slate-400 hover:text-brand-teal transition-colors">
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Detalles de la cita */}
      <div className="w-full max-w-xs space-y-3 mb-8">
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl text-left">
          <div className="w-8 h-8 rounded-lg bg-brand-navy/8 flex items-center justify-center flex-shrink-0">
            <Calendar size={15} className="text-brand-navy" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-sans uppercase tracking-wider">Fecha</p>
            <p className="text-brand-navy font-sans font-semibold text-sm capitalize">
              {format(start, "EEEE d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl text-left">
          <div className="w-8 h-8 rounded-lg bg-brand-navy/8 flex items-center justify-center flex-shrink-0">
            <Clock size={15} className="text-brand-navy" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-sans uppercase tracking-wider">Horario</p>
            <p className="text-brand-navy font-sans font-semibold text-sm">
              {format(start, "HH:mm")} – {format(end, "HH:mm")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl text-left">
          <div className="w-8 h-8 rounded-lg bg-brand-navy/8 flex items-center justify-center flex-shrink-0">
            <User size={15} className="text-brand-navy" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-sans uppercase tracking-wider">Profesional</p>
            <p className="text-brand-navy font-sans font-semibold text-sm">
              {result.staffName}
            </p>
          </div>
        </div>
      </div>

      <p className="text-slate-400 text-xs mb-4">
        Recibirás una confirmación por email con los detalles.
      </p>

      <button
        onClick={onNewBooking}
        className="px-6 py-3 rounded-xl font-sans font-semibold text-sm border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-200"
      >
        Hacer otra reserva
      </button>
    </div>
  );
}
