import { MapPin, ExternalLink } from "lucide-react";

type Props = {
  address: string | null;
  city: string | null;
  mapEmbed: string | null;
  businessName: string;
};

export function PublicMap({ address, city, mapEmbed, businessName }: Props) {
  if (!address && !mapEmbed) return null;

  const query = encodeURIComponent(`${businessName} ${address ?? ""} ${city ?? ""}`.trim());
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section id="ubicacion" className="px-4 md:px-10 py-8 md:py-10">
      <h2 className="font-sans font-bold text-brand-navy text-xl md:text-2xl mb-5">Cómo llegar</h2>

      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-brand-sm">
        {mapEmbed ? (
          <iframe
            src={mapEmbed}
            width="100%"
            height="320"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa de ${businessName}`}
          />
        ) : (
          <div className="h-48 bg-brand-mist/30 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-brand-teal mx-auto mb-2" />
              <p className="font-body text-brand-navy text-sm font-medium">{address}</p>
              {city && <p className="font-body text-slate-500 text-sm">{city}</p>}
            </div>
          </div>
        )}

        {address && (
          <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-teal shrink-0" />
              <span className="font-body text-slate-600 text-sm">
                {address}{city ? `, ${city}` : ""}
              </span>
            </div>
            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-sans font-semibold transition-colors duration-150 cursor-pointer hover:opacity-80 shrink-0"
              style={{ color: "var(--biz-primary, #0D1B2A)" }}
            >
              Abrir mapa <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
