"use client";

import { MapPin, Phone, Mail } from "lucide-react";
import type { PublicPageData } from "@/types/public-page";
import { SocialLinks } from "./SocialLinks";

type Props = {
  data: Pick<PublicPageData, "name" | "phone" | "email" | "address" | "city" | "socials" | "logoUrl">;
  onBook: () => void;
};

export function PublicFooter({ data, onBook }: Props) {
  const { name, phone, email, address, city, socials, logoUrl } = data;
  const year = new Date().getFullYear();
  const hasContact = phone || email || address || city;

  return (
    <footer className="bg-brand-navy text-white">
      {/* Bloque principal */}
      <div className="px-4 md:px-10 py-10 md:py-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">

        {/* Marca del negocio + CTA */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={name} className="w-11 h-11 rounded-xl object-cover border border-white/15" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-sans font-bold text-lg">
                {name[0]}
              </div>
            )}
            <span className="font-sans font-semibold text-lg">{name}</span>
          </div>
          <p className="font-body text-white/60 text-sm leading-relaxed mb-4 max-w-xs">
            Reserva tu hora online, sin llamadas y en segundos.
          </p>
          <button
            onClick={onBook}
            className="inline-flex items-center px-5 py-2.5 rounded-xl font-sans font-semibold text-sm
              bg-brand-teal text-brand-navy transition-[transform,filter] duration-150 ease-out
              hover:brightness-105 active:scale-[0.97] cursor-pointer"
          >
            Reservar ahora
          </button>
        </div>

        {/* Contacto */}
        {hasContact && (
          <div>
            <h3 className="font-sans font-semibold text-sm text-white/90 mb-4 uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-3 font-body text-sm text-white/70">
              {(address || city) && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-brand-teal shrink-0 mt-0.5" />
                  <span>{[address, city].filter(Boolean).join(", ")}</span>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone}`} className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <Phone size={15} className="text-brand-teal shrink-0" /> {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-white transition-colors break-all">
                    <Mail size={15} className="text-brand-teal shrink-0" /> {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Redes sociales */}
        <div>
          <h3 className="font-sans font-semibold text-sm text-white/90 mb-4 uppercase tracking-wider">
            Síguenos
          </h3>
          <SocialLinks socials={socials} variant="light" />
        </div>
      </div>

      {/* Barra inferior — marca Frandora */}
      <div className="border-t border-white/10 px-4 md:px-10 py-5
        flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="font-body text-white/50 text-xs">
          © {year} {name}. Todos los derechos reservados.
        </p>
        <a
          href="https://frandora.cl"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 font-body text-white/50 text-xs hover:text-white transition-colors"
        >
          <span>Hecho con</span>
          <span className="font-sans font-bold text-brand-teal group-hover:brightness-110">Frandora</span>
          <span className="text-white/30">·</span>
          <span className="text-white/40">Schedule smart. Grow more.</span>
        </a>
      </div>
    </footer>
  );
}
