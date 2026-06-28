import { generateThemeCSS, type ThemeConfig } from "@/lib/theme/generateThemeCSS";

interface Props {
  config: Partial<ThemeConfig>;
}

/**
 * Server Component: inyecta las variables CSS del tema del negocio en el <head>.
 * Se usa en DashboardLayout y en el layout de la página pública de booking.
 * No añade JavaScript al cliente.
 */
export function BusinessThemeInjector({ config }: Props) {
  const full: ThemeConfig = {
    primaryColorHsl:    config.primaryColorHsl    ?? "211 53% 11%",
    accentColorHsl:     config.accentColorHsl     ?? "170 25% 55%",
    secondaryColorHsl:  config.secondaryColorHsl  ?? "169 26% 85%",
    borderRadiusPreset: (config.borderRadiusPreset as ThemeConfig["borderRadiusPreset"]) ?? "rounded",
    densityPreset:      (config.densityPreset     as ThemeConfig["densityPreset"])      ?? "normal",
    dashboardBgType:    (config.dashboardBgType   as ThemeConfig["dashboardBgType"])    ?? "gradient",
    dashboardBgValue:   config.dashboardBgValue,
    fontFamily:         config.fontFamily,
    themeMode:          config.themeMode,
  };

  const css = generateThemeCSS(full);
  return <style id="biz-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
