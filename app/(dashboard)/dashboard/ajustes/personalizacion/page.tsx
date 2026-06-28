"use client";

import { useState, useCallback } from "react";
import { Palette, Check, Loader2, RotateCcw, Sun, Moon, Monitor } from "lucide-react";
import { BusinessThemeInjectorClient } from "@/components/providers/BusinessThemeInjectorClient";
import { THEME_PRESETS } from "@/lib/theme/generateThemeCSS";
import { hexToHsl } from "@/lib/theme/hexToHsl";
import type { ThemeConfig } from "@/lib/theme/generateThemeCSS";

// ── Tipos ─────────────────────────────────────────────────────────────────

type ThemeMode      = "light" | "dark" | "auto";
type BorderPreset   = "sharp" | "rounded" | "pill";
type DensityPreset  = "compact" | "normal" | "spacious";
type BgType         = "gradient" | "solid" | "image";
type Font           = "default" | "inter" | "poppins";

type Config = {
  themeMode:          ThemeMode;
  primaryColor:       string;
  accentColor:        string;
  borderRadiusPreset: BorderPreset;
  densityPreset:      DensityPreset;
  fontFamily:         Font;
  dashboardBgType:    BgType;
};

const DEFAULTS: Config = {
  themeMode:          "light",
  primaryColor:       "#0D1B2A",
  accentColor:        "#6FA89E",
  borderRadiusPreset: "rounded",
  densityPreset:      "normal",
  fontFamily:         "default",
  dashboardBgType:    "gradient",
};

// ── Helpers ───────────────────────────────────────────────────────────────

function toThemeConfig(c: Config): Partial<ThemeConfig> {
  return {
    primaryColorHsl:    hexToHsl(c.primaryColor),
    accentColorHsl:     hexToHsl(c.accentColor),
    secondaryColorHsl:  "169 26% 85%",
    borderRadiusPreset: c.borderRadiusPreset,
    densityPreset:      c.densityPreset,
    dashboardBgType:    c.dashboardBgType,
    fontFamily:         c.fontFamily === "default" ? null : c.fontFamily,
    themeMode:          c.themeMode,
  };
}

// ── Sub-componente: Card de sección ──────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5 md:p-6">
      <h2 className="text-brand-navy font-sans font-semibold text-xs uppercase tracking-[0.15em] mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Sub-componente: Grupo de opciones tipo toggle ─────────────────────────

type ToggleGroupProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ElementType }[];
};

function ToggleGroup<T extends string>({ value, onChange, options }: ToggleGroupProps<T>) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold border transition-all",
              active
                ? "text-white border-transparent"
                : "border-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
            style={active ? { background: "linear-gradient(135deg, #0D1B2A, #1a3347)" } : {}}
          >
            {Icon && <Icon size={14} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Mini-preview en vivo ──────────────────────────────────────────────────

function LivePreview({ config }: { config: Config }) {
  const sidebarBg  = config.primaryColor;
  const accentBg   = config.accentColor;
  const radius     = { sharp: "4px", rounded: "10px", pill: "20px" }[config.borderRadiusPreset];

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-44 flex select-none">
      {/* Sidebar simulado */}
      <div className="w-12 md:w-16 flex flex-col items-center pt-3 gap-2 shrink-0"
        style={{ background: sidebarBg }}>
        <div className="w-6 h-6 rounded-md bg-white/20" />
        {[0,1,2].map((i) => (
          <div key={i}
            className="w-8 h-1.5 rounded-full"
            style={{ background: i === 0 ? accentBg : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
      {/* Contenido simulado */}
      <div className="flex-1 p-3 bg-slate-50 flex flex-col gap-2">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="flex-1 grid grid-cols-2 gap-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-100 p-2 flex flex-col gap-1.5"
              style={{ borderRadius: radius }}>
              <div className="h-2 w-12 rounded bg-slate-200" />
              <div className="h-3 w-8 rounded font-bold"
                style={{ background: accentBg + "33" }} />
            </div>
          ))}
        </div>
        {/* Botón simulado */}
        <div className="h-6 rounded-lg flex items-center justify-center"
          style={{ background: sidebarBg, borderRadius: radius }}>
          <div className="h-1.5 w-16 rounded bg-white/60" />
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────

export default function PersonalizacionPage() {
  const [config, setConfig]   = useState<Config>(DEFAULTS);
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [error,  setError]    = useState<string | null>(null);

  const update = useCallback(<K extends keyof Config>(key: K, val: Config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }, []);

  const applyPreset = (preset: (typeof THEME_PRESETS)[number]) => {
    setConfig((prev) => ({
      ...prev,
      primaryColor: preset.primaryHex,
      accentColor:  preset.accentHex,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const body = {
      themeMode:          config.themeMode,
      densityPreset:      config.densityPreset,
      borderRadiusPreset: config.borderRadiusPreset,
      primaryColor:       config.primaryColor,
      accentColor:        config.accentColor,
      primaryColorHsl:    hexToHsl(config.primaryColor),
      accentColorHsl:     hexToHsl(config.accentColor),
      dashboardBgType:    config.dashboardBgType,
      fontFamily:         config.fontFamily === "default" ? null : config.fontFamily,
    };
    const res = await fetch("/api/customization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo guardar la personalización");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setConfig(DEFAULTS);
    setSaved(false);
  };

  // Inyector en vivo (sin re-mount)
  const themeConfig = toThemeConfig(config);

  return (
    <>
      <BusinessThemeInjectorClient config={themeConfig} />

      <div
        className="min-h-screen p-4 md:p-8"
        style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
      >
        <div className="max-w-2xl mx-auto">

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-0.5">
              <Palette size={18} className="text-brand-teal" />
              <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">
                Apariencia
              </p>
            </div>
            <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
              Personaliza tu panel
            </h1>
            <p className="text-slate-400 text-sm font-body mt-1">
              Los cambios se aplican en tiempo real. Guarda cuando estés listo.
            </p>
          </div>

          <div className="space-y-5">

            {/* ── Preview en vivo ───────────────────────────────── */}
            <SectionCard title="Vista previa en vivo">
              <LivePreview config={config} />
            </SectionCard>

            {/* ── Tema ─────────────────────────────────────────── */}
            <SectionCard title="Tema">
              <ToggleGroup<ThemeMode>
                value={config.themeMode}
                onChange={(v) => update("themeMode", v)}
                options={[
                  { value: "light", label: "Claro",     icon: Sun },
                  { value: "dark",  label: "Oscuro",    icon: Moon },
                  { value: "auto",  label: "Automático",icon: Monitor },
                ]}
              />
            </SectionCard>

            {/* ── Colores ──────────────────────────────────────── */}
            <SectionCard title="Paleta de colores">
              {/* Paletas predefinidas */}
              <div className="flex gap-2 flex-wrap mb-5">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    title={preset.name}
                    className="group flex flex-col items-center gap-1"
                  >
                    <div className="flex rounded-xl overflow-hidden border-2 transition-all border-transparent group-hover:border-brand-teal/50 group-hover:scale-105">
                      <span className="w-7 h-7 block" style={{ background: preset.primaryHex }} />
                      <span className="w-7 h-7 block" style={{ background: preset.accentHex }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-body leading-none max-w-[56px] text-center truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Pickers manuales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Color primario
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => update("primaryColor", e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <span className="text-sm font-body text-slate-500 uppercase tracking-wider">
                      {config.primaryColor}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Color de acento
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => update("accentColor", e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <span className="text-sm font-body text-slate-500 uppercase tracking-wider">
                      {config.accentColor}
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── Bordes ───────────────────────────────────────── */}
            <SectionCard title="Estilo de bordes">
              <ToggleGroup<BorderPreset>
                value={config.borderRadiusPreset}
                onChange={(v) => update("borderRadiusPreset", v)}
                options={[
                  { value: "sharp",   label: "Suave" },
                  { value: "rounded", label: "Redondeado" },
                  { value: "pill",    label: "Píldora" },
                ]}
              />
            </SectionCard>

            {/* ── Densidad ─────────────────────────────────────── */}
            <SectionCard title="Densidad">
              <ToggleGroup<DensityPreset>
                value={config.densityPreset}
                onChange={(v) => update("densityPreset", v)}
                options={[
                  { value: "compact",   label: "Compacto" },
                  { value: "normal",    label: "Normal" },
                  { value: "spacious",  label: "Espacioso" },
                ]}
              />
            </SectionCard>

            {/* ── Tipografía ───────────────────────────────────── */}
            <SectionCard title="Tipografía">
              <ToggleGroup<Font>
                value={config.fontFamily}
                onChange={(v) => update("fontFamily", v)}
                options={[
                  { value: "default", label: "Por defecto (Poppins + Inter)" },
                  { value: "inter",   label: "Inter (todo)" },
                  { value: "poppins", label: "Poppins (todo)" },
                ]}
              />
            </SectionCard>

            {/* ── Fondo del panel ──────────────────────────────── */}
            <SectionCard title="Fondo del panel">
              <ToggleGroup<BgType>
                value={config.dashboardBgType}
                onChange={(v) => update("dashboardBgType", v)}
                options={[
                  { value: "gradient", label: "Gradiente" },
                  { value: "solid",    label: "Sólido" },
                  { value: "image",    label: "Imagen" },
                ]}
              />
            </SectionCard>

            {/* ── Acciones ─────────────────────────────────────── */}
            {error && (
              <p className="text-sm text-red-500 font-body text-center">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-sans font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                <RotateCcw size={15} />
                Restaurar por defecto
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl font-sans font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" />Guardando...</>
                ) : saved ? (
                  <><Check size={16} className="text-brand-teal" />¡Guardado!</>
                ) : (
                  "Guardar cambios"
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
