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
 * Isotipo Frandora con efecto 3D premium
 * variant="light" → logo blanco para fondos oscuros (sidebar, hero, footer)
 * variant="dark"  → logo navy para fondos claros (navbar, tarjetas, email)
 *
 * Archivos requeridos en /public/:
 *   logo-light.png → F blanca sobre fondo navy (para variant="light")
 *   logo-dark.png  → F navy sobre fondo blanco (para variant="dark")
 */
function FIsotipo({ size, variant = "dark" }: { size: number; variant?: Variant }) {
  const src    = variant === "light" ? "/logo-light.png" : "/logo-dark.png";
  const height = Math.round(size * 1.1);

  // Sombras premium por variante
  const shadowLight = [
    "0 1px 0 rgba(255,255,255,0.35) inset",           // highlight superior
    "0 -1px 0 rgba(0,0,0,0.25) inset",                // sombra inferior interna
    "0 6px 16px rgba(13,27,42,0.55)",                  // sombra exterior profunda
    "0 2px 4px rgba(13,27,42,0.35)",                   // sombra cercana
    "0 0 0 1px rgba(255,255,255,0.12)",                // borde sutil
    "0 0 24px rgba(111,168,158,0.22)",                 // glow teal
  ].join(", ");

  const shadowDark = [
    "0 1px 0 rgba(255,255,255,0.6) inset",
    "0 -1px 0 rgba(0,0,0,0.12) inset",
    "0 6px 20px rgba(13,27,42,0.22)",
    "0 2px 6px rgba(13,27,42,0.12)",
    "0 0 0 1px rgba(13,27,42,0.08)",
    "0 0 20px rgba(111,168,158,0.18)",
  ].join(", ");

  const shadow = variant === "light" ? shadowLight : shadowDark;

  // Fondo del contenedor: navy profundo para light, blanco para dark
  const bg = variant === "light"
    ? "linear-gradient(160deg, #1a3347 0%, #0D1B2A 50%, #091520 100%)"
    : "linear-gradient(160deg, #ffffff 0%, #f4f8f7 100%)";

  const border = variant === "light"
    ? "1px solid rgba(111,168,158,0.3)"
    : "1px solid rgba(13,27,42,0.12)";

  return (
    <div
      style={{
        width:        size,
        height:       size,
        borderRadius: "22%",
        background:   bg,
        border,
        boxShadow:    shadow,
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        flexShrink:   0,
        overflow:     "hidden",
        position:     "relative",
      }}
    >
      {/* Highlight superior (efecto 3D) */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "45%",
        background: variant === "light"
          ? "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, transparent 100%)",
        borderRadius: "22% 22% 0 0",
        pointerEvents: "none",
        zIndex: 1,
      }} />

      <Image
        src={src}
        alt="Frandora"
        width={size}
        height={height}
        style={{
          objectFit: "contain",
          padding:    size * 0.1,
          position:  "relative",
          zIndex:    0,
        }}
        priority
      />
    </div>
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
  const nameColor = variant === "light" ? "text-white"        : "text-brand-navy";
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
