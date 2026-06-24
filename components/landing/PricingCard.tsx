import Link from "next/link";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  isAnnual: boolean;
  description: string;
  features: string[];
  staffLimit: string;
  isPopular?: boolean;
  isCta?: boolean;
}

export default function PricingCard({
  name,
  monthlyPrice,
  annualPrice,
  isAnnual,
  description,
  features,
  staffLimit,
  isPopular,
  isCta,
}: PricingCardProps) {
  const price = isAnnual ? annualPrice : monthlyPrice;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
        isPopular
          ? "bg-brand-navy text-white shadow-teal-lg scale-[1.02] border border-brand-teal/40"
          : "bg-white border border-brand-mist shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5"
      }`}
    >
      {/* Badge popular */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand-teal text-white text-[11px] font-sans font-semibold px-3 py-1 rounded-full">
            Más popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <p className={`font-body text-xs font-medium uppercase tracking-wider mb-1 ${isPopular ? "text-brand-teal" : "text-brand-teal"}`}>
          {staffLimit}
        </p>
        <h3 className={`font-sans font-bold text-xl mb-1 ${isPopular ? "text-white" : "text-brand-navy"}`}>
          {name}
        </h3>
        <p className={`font-body text-sm ${isPopular ? "text-white/60" : "text-brand-navy/55"}`}>
          {description}
        </p>
      </div>

      {/* Precio */}
      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className={`font-sans font-bold text-4xl ${isPopular ? "text-white" : "text-brand-navy"}`}>
            ${price}
          </span>
          <span className={`font-body text-sm pb-1 ${isPopular ? "text-white/50" : "text-brand-navy/50"}`}>
            /mes
          </span>
        </div>
        {isAnnual && (
          <p className="font-body text-xs text-brand-teal mt-1">
            Facturado anualmente · ahorras ${(monthlyPrice - annualPrice) * 12}/año
          </p>
        )}
      </div>

      {/* CTA */}
      <Link
        href="https://app.frandora.cl/sign-up"
        className={`text-center text-sm font-sans font-semibold py-3 rounded-xl transition-all duration-200 mb-6 block ${
          isPopular
            ? "bg-brand-teal text-white hover:bg-brand-teal/90 shadow-teal"
            : "bg-brand-gray text-brand-navy hover:bg-brand-mist border border-brand-mist"
        }`}
      >
        {isCta ? "Contactar ventas" : "Empezar gratis 14 días"}
      </Link>

      {/* Features */}
      <ul className="space-y-2.5 flex-1">
        {features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5">
            <Check
              size={14}
              className={`shrink-0 mt-0.5 ${isPopular ? "text-brand-teal" : "text-brand-teal"}`}
            />
            <span className={`font-body text-sm leading-snug ${isPopular ? "text-white/80" : "text-brand-navy/70"}`}>
              {feat}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
