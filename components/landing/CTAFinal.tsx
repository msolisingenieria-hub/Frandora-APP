import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTAFinal() {
  return (
    <section className="relative bg-brand-navy py-20 md:py-28 overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl" />
        {/* Wave decorativo del logo */}
        <svg
          className="absolute bottom-0 left-0 right-0 opacity-10 w-full"
          viewBox="0 0 1440 120"
          fill="none"
        >
          <path
            d="M0 80C120 60 240 40 480 60C720 80 960 100 1200 80C1320 70 1380 65 1440 60V120H0V80Z"
            fill="#6FA89E"
          />
        </svg>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 md:px-8 text-center">
        <span className="text-brand-caps text-brand-teal text-xs mb-4 block">
          Empieza hoy
        </span>

        <h2 className="font-sans font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-5">
          Tu negocio merece las mejores{" "}
          <span className="text-brand-teal">herramientas</span>
        </h2>

        <p className="font-body text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Únete a cientos de negocios que ya gestionan su agenda con Frandora.
          14 días gratis, sin tarjeta de crédito, cancela cuando quieras.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="https://app.frandora.cl/sign-up"
            className="btn-brand flex items-center justify-center gap-2 text-base px-8 py-3.5"
          >
            Crear mi cuenta gratis
            <ArrowRight size={16} />
          </Link>
          <a
            href="mailto:hola@frandora.cl"
            className="flex items-center justify-center gap-2 text-base font-sans font-medium text-white/70
                       border border-white/20 rounded-lg px-8 py-3.5
                       hover:border-brand-teal hover:text-brand-teal transition-all duration-200"
          >
            Hablar con ventas
          </a>
        </div>

        <p className="font-body text-white/30 text-sm mt-8">
          Sin tarjeta de crédito · Sin compromisos · Cancela cuando quieras
        </p>
      </div>
    </section>
  );
}
