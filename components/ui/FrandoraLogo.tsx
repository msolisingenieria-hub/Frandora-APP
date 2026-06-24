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
  xs: { mark: 24, name: "text-sm",   tagline: "text-[8px]",  gap: "gap-2"   },
  sm: { mark: 30, name: "text-base", tagline: "text-[9px]",  gap: "gap-2.5" },
  md: { mark: 38, name: "text-xl",   tagline: "text-[10px]", gap: "gap-3"   },
  lg: { mark: 48, name: "text-2xl",  tagline: "text-xs",     gap: "gap-3.5" },
  xl: { mark: 60, name: "text-3xl",  tagline: "text-sm",     gap: "gap-4"   },
};

// Isotipo F — aproximación premium del logo oficial Frandora
// F cursiva blanca + swoosh teal + punto teal
function FMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        {/* Fondo navy con gradiente radial para profundidad */}
        <radialGradient id="fmark-bg" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#1a3347" />
          <stop offset="100%" stopColor="#0a1828" />
        </radialGradient>
        {/* Glow teal sutil en el fondo */}
        <radialGradient id="fmark-glow" cx="70%" cy="25%" r="50%">
          <stop offset="0%" stopColor="#6FA89E" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6FA89E" stopOpacity="0" />
        </radialGradient>
        {/* Gradiente blanco-cálido para la F */}
        <linearGradient id="fmark-f" x1="8" y1="8" x2="30" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d8ecec" />
        </linearGradient>
      </defs>

      {/* Fondo redondeado */}
      <rect width="40" height="40" rx="9" fill="url(#fmark-bg)" />
      <rect width="40" height="40" rx="9" fill="url(#fmark-glow)" />

      {/* ── F blanca cursiva ── */}
      {/* Brazo superior — sweeps elegantly right from stem */}
      <path
        d="M 13,27 C 13,16 14,11 18,9.5 C 22,8.5 27,10.5 30,13.5"
        stroke="url(#fmark-f)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tallo inferior — slight curve like calligraphic tail */}
      <path
        d="M 13,27 C 12.5,30.5 12.5,32.5 14,34.5"
        stroke="url(#fmark-f)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Swoosh teal — crossbar de la F ── */}
      <path
        d="M 8.5,21.5 C 11.5,18.5 16,17.5 20,20 C 22.5,21.5 25,22.5 27.5,21.5"
        stroke="#6FA89E"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Punto teal — marca de la F */}
      <circle cx="27.5" cy="21.5" r="3" fill="#6FA89E" />

      {/* Estrella de 4 puntas — elemento decorativo de marca (visible en md+) */}
      {size >= 36 && (
        <path
          d="M 33,33 L 33.7,34.7 L 35.5,35.5 L 33.7,36.3 L 33,38 L 32.3,36.3 L 30.5,35.5 L 32.3,34.7 Z"
          fill="white"
          opacity="0.35"
        />
      )}
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
  const nameColor = variant === "light" ? "text-white" : "text-brand-navy";
  const tagColor = variant === "light" ? "text-brand-teal/80" : "text-brand-teal";

  if (iconOnly) return <FMark size={s.mark} />;

  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      <FMark size={s.mark} />
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
