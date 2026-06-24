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
  xs: { mark: 26,  name: "text-sm",   tagline: "text-[8px]",  gap: "gap-2"   },
  sm: { mark: 34,  name: "text-base", tagline: "text-[9px]",  gap: "gap-2.5" },
  md: { mark: 42,  name: "text-xl",   tagline: "text-[10px]", gap: "gap-3"   },
  lg: { mark: 52,  name: "text-2xl",  tagline: "text-xs",     gap: "gap-3.5" },
  xl: { mark: 66,  name: "text-3xl",  tagline: "text-sm",     gap: "gap-4"   },
};

/**
 * Isotipo Frandora — F con swoosh teal
 * variant="light" → F blanca para fondos oscuros (sidebar, hero, footer)
 * variant="dark"  → F navy para fondos claros (navbar, tarjetas, email)
 */
function FIsotipo({ size, variant = "dark" }: { size: number; variant?: Variant }) {
  const fColor = variant === "light" ? "#FFFFFF" : "#0D1B2A";
  const teal   = "#6FA89E";
  const h      = Math.round(size * 1.26); // proporción del isotipo real

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 90 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ flexShrink: 0, display: "block" }}
    >
      {/* Brazo superior de la F */}
      <path
        d="M13 8 L65 8 Q80 8 80 24 Q80 41 64 44 L26 44 L16 57 L13 57 Z"
        fill={fColor}
      />
      {/* Tallo inferior de la F */}
      <path
        d="M13 63 L25 63 L22 106 Q21 112 16 112 L12 112 Z"
        fill={fColor}
      />
      {/* Swoosh teal — barra central de la F */}
      <path
        d="M9 63 Q36 49 84 66 Q67 77 38 73 Q20 69 9 63 Z"
        fill={teal}
      />
      {/* Punto teal */}
      <circle cx="80" cy="77" r="5.5" fill={teal} />
    </svg>
  );
}

export function FrandoraLogo({
  size = "md",
  variant = "dark",
  showTagline = false,
  iconOnly = false,
  className = "",
}: Props) {
  const s = SIZES[size];
  const nameColor = variant === "light" ? "text-white"      : "text-brand-navy";
  const tagColor  = variant === "light" ? "text-brand-teal/80" : "text-brand-teal";

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
