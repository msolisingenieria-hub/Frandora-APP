"use client";

import { useState } from "react";
import PricingCard from "./PricingCard";

const PLANS = [
  {
    name: "Starter",
    monthlyPrice: 19,
    annualPrice: 15,
    staffLimit: "1 profesional",
    description: "Ideal para autónomos y freelancers.",
    features: [
      "Página de reservas pública",
      "Agenda y calendario",
      "Hasta 100 reservas/mes",
      "Clientes ilimitados",
      "Confirmaciones por email",
      "Punto de venta básico",
      "Soporte por email",
    ],
  },
  {
    name: "Professional",
    monthlyPrice: 49,
    annualPrice: 39,
    staffLimit: "Hasta 3 profesionales",
    description: "Para equipos pequeños en crecimiento.",
    features: [
      "Todo lo de Starter",
      "Hasta 500 reservas/mes",
      "WhatsApp + SMS incluidos",
      "Inventario básico",
      "Recordatorios automáticos",
      "Gift cards digitales",
      "Reportes de ventas",
      "Soporte prioritario",
    ],
    isPopular: true,
  },
  {
    name: "Business",
    monthlyPrice: 99,
    annualPrice: 79,
    staffLimit: "Hasta 10 profesionales",
    description: "Para negocios consolidados.",
    features: [
      "Todo lo de Professional",
      "Reservas ilimitadas",
      "Email marketing",
      "Programa de lealtad",
      "3 sucursales",
      "Dominio propio",
      "POS avanzado + caja",
      "Comisiones de staff",
    ],
  },
  {
    name: "Scale",
    monthlyPrice: 179,
    annualPrice: 143,
    staffLimit: "Staff y sucursales ilimitadas",
    description: "Para cadenas y multi-sucursal.",
    features: [
      "Todo lo de Business",
      "Sucursales ilimitadas",
      "API acceso completo",
      "Webhooks y zapier",
      "Dashboard multi-local",
      "White-label disponible",
      "Gerente de cuenta",
      "SLA garantizado",
    ],
    isCta: false,
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="relative bg-brand-gray py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-caps text-xs mb-3 block">Planes y precios</span>
          <h2 className="font-sans font-bold text-3xl md:text-4xl lg:text-5xl text-brand-navy leading-tight mb-4">
            Precio claro, sin sorpresas
          </h2>
          <p className="font-body text-brand-navy/60 text-base md:text-lg mb-8">
            14 días gratis en todos los planes. Sin tarjeta de crédito.
          </p>

          {/* Toggle mensual / anual */}
          <div className="inline-flex items-center gap-3 bg-white border border-brand-mist rounded-full p-1 shadow-brand-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-sans font-medium transition-all ${
                !isAnnual
                  ? "bg-brand-navy text-white shadow-brand-sm"
                  : "text-brand-navy/60 hover:text-brand-navy"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-sans font-medium transition-all flex items-center gap-2 ${
                isAnnual
                  ? "bg-brand-navy text-white shadow-brand-sm"
                  : "text-brand-navy/60 hover:text-brand-navy"
              }`}
            >
              Anual
              <span className="bg-brand-teal text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {PLANS.map((plan) => (
            <PricingCard key={plan.name} {...plan} isAnnual={isAnnual} />
          ))}
        </div>

        {/* Enterprise note */}
        <p className="text-center font-body text-sm text-brand-navy/50 mt-10">
          ¿Franquicias o grandes cadenas?{" "}
          <a href="mailto:hola@frandora.cl" className="text-brand-teal hover:underline font-medium">
            Contáctanos para Enterprise
          </a>
        </p>
      </div>
    </section>
  );
}
