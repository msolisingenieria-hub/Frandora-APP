"use client";

import { useEffect } from "react";
import { generateThemeCSS, type ThemeConfig } from "@/lib/theme/generateThemeCSS";

interface Props {
  config: Partial<ThemeConfig>;
}

/**
 * Client Component: actualiza las variables CSS del tema en tiempo real.
 * Usado en la página de Personalización para preview instantáneo sin reload.
 */
export function BusinessThemeInjectorClient({ config }: Props) {
  useEffect(() => {
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
    let el = document.getElementById("biz-theme") as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = "biz-theme";
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [config]);

  return null;
}
