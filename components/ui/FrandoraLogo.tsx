type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Variant = "dark" | "light"; // dark = sobre fondo claro, light = sobre fondo oscuro

type Props = {
  size?: Size;
  variant?: Variant;
  showTagline?: boolean;
  className?: string;
};

const SIZES: Record<Size, { mark: number; name: string; tagline: string; gap: string }> = {
  xs: { mark: 24, name: "text-base",  tagline: "text-[8px]",  gap: "gap-2"   },
  sm: { mark: 30, name: "text-lg",    tagline: "text-[9px]",  gap: "gap-2.5" },
  md: { mark: 36, name: "text-xl",    tagline: "text-[10px]", gap: "gap-3"   },
  lg: { mark: 44, name: "text-2xl",   tagline: "text-xs",     gap: "gap-3"   },
  xl: { mark: 56, name: "text-3xl",   tagline: "text-sm",     gap: "gap-3.5" },
};

export function FrandoraLogo({ size = "md", variant = "dark", showTagline = false, className = "" }: Props) {
  const s = SIZES[size];
  const nameColor = variant === "light" ? "text-white" : "text-brand-navy";
  const taglineColor = "text-brand-teal";

  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      {/* Isotipo F */}
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Fondo redondeado navy */}
        <rect width="40" height="40" rx="10" fill="#0D1B2A" />
        {/* Acento teal en esquina superior derecha */}
        <rect x="26" y="0" width="14" height="14" rx="0" fill="#6FA89E" opacity="0.25" />
        <rect x="32" y="0" width="8" height="8" rx="0" fill="#6FA89E" opacity="0.4" />
        {/* Letra F — barra vertical izquierda */}
        <rect x="11" y="10" width="5" height="20" rx="1.5" fill="white" />
        {/* Barra superior horizontal */}
        <rect x="11" y="10" width="14" height="4.5" rx="1.5" fill="white" />
        {/* Barra media horizontal */}
        <rect x="11" y="19" width="11" height="4" rx="1.5" fill="white" />
        {/* Punto teal — acento de marca */}
        <circle cx="30" cy="30" r="3" fill="#6FA89E" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-sans font-bold tracking-tight ${s.name} ${nameColor}`}>
          Frandora
        </span>
        {showTagline && (
          <span className={`font-sans font-medium tracking-[0.15em] uppercase ${s.tagline} ${taglineColor} mt-0.5`}>
            Schedule Smart.
          </span>
        )}
      </div>
    </div>
  );
}
