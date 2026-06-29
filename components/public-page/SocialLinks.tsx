"use client";

import type { PublicSocials } from "@/types/public-page";

type Variant = "light" | "dark";

type Props = {
  socials: PublicSocials;
  variant?: Variant; // "light" = sobre fondo oscuro (iconos claros)
  className?: string;
};

// Normaliza un handle o URL a una URL completa y válida.
function buildUrl(kind: keyof PublicSocials, raw: string): string {
  const value = raw.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const handle = value.replace(/^@/, "");
  switch (kind) {
    case "instagram": return `https://instagram.com/${handle}`;
    case "facebook":  return `https://facebook.com/${handle}`;
    case "tiktok":    return `https://tiktok.com/@${handle}`;
    case "whatsapp":  return `https://wa.me/${handle.replace(/[^0-9]/g, "")}`;
  }
}

const LABELS: Record<keyof PublicSocials, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
};

// Paths SVG (viewBox 24x24, currentColor) — un solo set, estilo coherente.
const ICONS: Record<keyof PublicSocials, React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" />
    </>
  ),
  facebook: (
    <path d="M14 9h2.5V6H14c-2 0-3.5 1.5-3.5 3.5V11H8.5v3h2V22h3v-8h2.3l.7-3h-3V9.7c0-.5.3-.7.7-.7Z" />
  ),
  tiktok: (
    <path d="M16 3c.3 2 1.6 3.7 3.5 4.2v3c-1.3 0-2.5-.3-3.5-.9V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.1a3 3 0 1 0 2 2.8V3h3Z" />
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Zm0 16.2c-1.4 0-2.7-.4-3.8-1l-.3-.2-2.7.7.7-2.6-.2-.3A7.2 7.2 0 1 1 12 19.2Zm4-5.2c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.5.1l-.7.8c-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.4-.4-.5-.1-.5.2-1 .1-.2.1-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.6-.8 2.6.3 1.5 1.3 2.8 2.6 3.7 1.6 1 2.8 1.1 3.6.9.6-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1l-.4-.2Z" />
  ),
};

export function SocialLinks({ socials, variant = "light", className = "" }: Props) {
  const entries = (Object.keys(LABELS) as (keyof PublicSocials)[])
    .map((k) => ({ kind: k, raw: socials[k] }))
    .filter((e): e is { kind: keyof PublicSocials; raw: string } => !!e.raw);

  if (entries.length === 0) return null;

  const base =
    variant === "light"
      ? "text-white/85 bg-white/10 hover:bg-white/20 border-white/15"
      : "text-brand-navy bg-brand-mist/40 hover:bg-brand-mist border-slate-200";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {entries.map(({ kind, raw }) => (
        <a
          key={kind}
          href={buildUrl(kind, raw)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={LABELS[kind]}
          className={`flex items-center justify-center w-10 h-10 rounded-full border
            transition-[transform,background-color] duration-150 ease-out
            hover:-translate-y-0.5 active:scale-[0.92] cursor-pointer ${base}`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={kind === "instagram" ? "none" : "currentColor"}
            stroke={kind === "instagram" ? "currentColor" : "none"}
            strokeWidth="1.8"
            aria-hidden="true"
          >
            {ICONS[kind]}
          </svg>
        </a>
      ))}
    </div>
  );
}
