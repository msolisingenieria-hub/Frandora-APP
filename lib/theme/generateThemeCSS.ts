export type ThemeConfig = {
  primaryColorHsl:    string;
  accentColorHsl:     string;
  secondaryColorHsl:  string;
  borderRadiusPreset: "sharp" | "rounded" | "pill";
  densityPreset:      "compact" | "normal" | "spacious";
  dashboardBgType:    "solid" | "gradient" | "image";
  dashboardBgValue?:  string | null;
  fontFamily?:        string | null;
  themeMode?:         string | null;
};

const RADIUS: Record<string, string> = {
  sharp:   "0.25rem",
  rounded: "0.75rem",
  pill:    "1.5rem",
};

const DENSITY: Record<string, Record<string, string>> = {
  compact:  { xs: "0.125rem", sm: "0.25rem", md: "0.5rem",  lg: "0.75rem", xl: "1rem"  },
  normal:   { xs: "0.25rem",  sm: "0.5rem",  md: "1rem",    lg: "1.5rem",  xl: "2rem"  },
  spacious: { xs: "0.5rem",   sm: "0.75rem", md: "1.5rem",  lg: "2rem",    xl: "3rem"  },
};

export function generateThemeCSS(config: ThemeConfig): string {
  const d = DENSITY[config.densityPreset] ?? DENSITY.normal;
  const r = RADIUS[config.borderRadiusPreset] ?? RADIUS.rounded;

  return `
:root {
  --biz-primary:        ${config.primaryColorHsl};
  --biz-primary-fg:     0 0% 100%;
  --biz-accent:         ${config.accentColorHsl};
  --biz-accent-fg:      0 0% 100%;
  --biz-secondary:      ${config.secondaryColorHsl};
  --radius:             ${r};
  --biz-radius:         ${r};
  --density-space-xs:   ${d.xs};
  --density-space-sm:   ${d.sm};
  --density-space-md:   ${d.md};
  --density-space-lg:   ${d.lg};
  --density-space-xl:   ${d.xl};
}`.trim();
}

/** Preset palettes for one-click theme switching */
export const THEME_PRESETS = [
  {
    name: "Frandora Classic",
    primaryHex: "#0D1B2A", accentHex: "#6FA89E", secondaryHex: "#CFE3DF",
  },
  {
    name: "Ocean Deep",
    primaryHex: "#0A2342", accentHex: "#2CA6A4", secondaryHex: "#B8E0DF",
  },
  {
    name: "Sunset",
    primaryHex: "#1A0533", accentHex: "#E05C97", secondaryHex: "#F7B8D5",
  },
  {
    name: "Forest",
    primaryHex: "#1B3A2D", accentHex: "#4CAF7D", secondaryHex: "#C8E6D2",
  },
  {
    name: "Midnight",
    primaryHex: "#0D0D1A", accentHex: "#7B6CF6", secondaryHex: "#D4D0FA",
  },
] as const;
