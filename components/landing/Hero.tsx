"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Star } from "lucide-react";
import BookingMockup from "./BookingMockup";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background: blanco arriba → navy abajo */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-mist/30 to-brand-navy pointer-events-none" />

      {/* Decoración: círculo glow teal */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-brand-navy/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 w-full py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Lado izquierdo: texto ── */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full px-4 py-1.5 mb-6">
              <CalendarCheck size={13} className="text-brand-teal" />
              <span className="text-brand-caps text-[11px]">Schedule Smart. Grow More.</span>
            </div>

            {/* Headline */}
            <h1 className="font-sans font-bold text-brand-navy leading-tight mb-5">
              <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl block">
                Gestiona tu negocio.
              </span>
              <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl block gradient-text mt-1">
                Haz crecer tu agenda.
              </span>
            </h1>

            {/* Descripción */}
            <p className="font-body text-brand-navy/65 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              La plataforma más completa para negocios de servicios. Agenda,
              clientes, pagos, inventario y marketing — todo en un solo lugar,
              desde <span className="text-brand-teal font-medium">$19/mes</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <Link
                href="https://app.frandora.cl/sign-up"
                className="btn-brand flex items-center justify-center gap-2 text-base"
              >
                Empieza gratis 14 días
                <ArrowRight size={16} />
              </Link>
              <a
                href="#pricing"
                className="btn-brand-outline flex items-center justify-center gap-2 text-base"
              >
                Ver planes
              </a>
            </div>

            {/* Social proof minimalista */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-brand-teal text-brand-teal" />
                ))}
                <span className="font-body text-brand-navy/60 ml-1">5.0 promedio</span>
              </div>
              <span className="hidden sm:block text-brand-navy/20">·</span>
              <span className="font-body text-brand-navy/60">
                Sin tarjeta de crédito · Cancela cuando quieras
              </span>
            </div>
          </div>

          {/* ── Lado derecho: mockup de la app ── */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end px-6 sm:px-12 lg:px-0">
            <BookingMockup />
          </div>
        </div>
      </div>

      {/* Wave bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L48 51.7C96 43.3 192 26.7 288 23.3C384 20 480 30 576 35C672 40 768 40 864 36.7C960 33.3 1056 26.7 1152 25C1248 23.3 1344 26.7 1392 28.3L1440 30V60H0Z" fill="white" fillOpacity="0.06"/>
        </svg>
      </div>
    </section>
  );
}
