import Image from "next/image";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Variant = "dark" | "light";

type Props = {
  size?: Size;
  variant?: Variant;
  showTagline?: boolean;
  iconOnly?: boolean;
  className?: string;
};

const SIZES: Record<Size, { mark: number; name: string; tagline: string; gap: string }> = {
  xs: { mark: 28,  name: "text-sm",   tagline: "text-[8px]",  gap: "gap-2"   },
  sm: { mark: 36,  name: "text-base", tagline: "text-[9px]",  gap: "gap-2.5" },
  md: { mark: 44,  name: "text-xl",   tagline: "text-[10px]", gap: "gap-3"   },
  lg: { mark: 54,  name: "text-2xl",  tagline: "text-xs",     gap: "gap-3.5" },
  xl: { mark: 68,  name: "text-3xl",  tagline: "text-sm",     gap: "gap-4"   },
};

/**
 * variant="light" → logo-light.png (F blanca) — para fondos oscuros: sidebar, hero, footer
 * variant="dark"  → logo-dark.png  (F navy)   — para fondos claros:  navbar, tarjetas
 *
 * El efecto premium (iluminación + sombra) se aplica DIRECTAMENTE sobre la imagen.
 * Sin contenedor, sin caja — solo el logo con las esquinas redondeadas y glow.
 */
function FIsotipo({ size, variant = "dark" }: { size: number; variant?: Variant }) {
  const src = variant === "light" ? "/logo-light.png" : "/logo-dark.png";

  // Sombras y glow aplicados directamente sobre el PNG
  const shadowLight = [
    "0 0 0 0.5px rgba(255,255,255,0.12)",        // micro-borde superior para definición
    "0 2px 6px rgba(13,27,42,0.5)",              // sombra cercana
    "0 8px 24px rgba(13,27,42,0.55)",            // sombra principal
    "0 0 40px rgba(111,168,158,0.35)",           // glow teal
    "0 0 80px rgba(111,168,158,0.12)",           // halo amplio
  ].join(", ");

  const shadowDark = [
    "0 0 0 0.5px rgba(13,27,42,0.08)",
    "0 2px 6px rgba(13,27,42,0.12)",
    "0 6px 20px rgba(13,27,42,0.18)",
    "0 0 30px rgba(111,168,158,0.2)",
  ].join(", ");

  // filter para el efecto de iluminación premium (brillo en los bordes del isotipo)
  const filterLight = [
    "drop-shadow(0 1px 2px rgba(255,255,255,0.25))",  // highlight blanco en bordes
    "drop-shadow(0 -1px 1px rgba(111,168,158,0.3))",  // acento teal superior
    "brightness(1.04)",
    "contrast(1.02)",
  ].join(" ");

  const filterDark = [
    "drop-shadow(0 1px 1px rgba(13,27,42,0.2))",
    "brightness(1.0)",
    "contrast(1.01)",
  ].join(" ");

  return (
    <Image
      src={src}
      alt="Frandora"
      width={size}
      height={size}
      priority
      style={{
        borderRadius:  "22%",
        display:       "block",
        flexShrink:    0,
        boxShadow:     variant === "light" ? shadowLight : shadowDark,
        filter:        variant === "light" ? filterLight : filterDark,
        transition:    "box-shadow 0.2s ease, filter 0.2s ease",
      }}
    />
  );
}

export function FrandoraLogo({
  size = "md",
  variant = "dark",
  showTagline = false,
  iconOnly = false,
  className = "",
}: Props) {
  const s         = SIZES[size];
  const nameColor = variant === "light" ? "text-white"          : "text-brand-navy";
  const tagColor  = variant === "light" ? "text-brand-teal/80"  : "text-brand-teal";

  if (iconOnly) return <FIsotipo size={s.mark} variant={variant} />;

  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      <FIsotipo size={s.mark} variant={variant} />
      <div className="flex flex-col leading-none">
        <span className={`font-sans font-bold tracking-tight ${s.name} ${nameColor}`}>
          Frandora
        </span>
        {showTagline && (
          <span className={`font-sans font-semibold tracking-[0.16em] uppercase ${s.tagline} ${tagColor} mt-0.5`}>
            Schedule Smart.
          </span>
        )}
      </div>
    </div>
  );
}
