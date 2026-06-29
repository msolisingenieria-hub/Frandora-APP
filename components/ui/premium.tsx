import * as React from "react";
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ════════════════════════════════════════════════════════════════════
// Design System Frandora — capa premium de marca.
//
// Consolida el patrón de botón con gradiente navy que hoy está repetido
// inline en ~34 archivos. Paleta y tipografía oficiales (CLAUDE.md):
// Deep Navy #0D1B2A · Sage Teal #6FA89E · Mist #CFE3DF · Poppins/Inter.
//
// No reemplaza a shadcn/ui (components/ui/button.tsx, etc.): es la capa
// opinada de marca. Migración a estos componentes incremental.
// ════════════════════════════════════════════════════════════════════

type ButtonVariant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const buttonVariantClass: Record<ButtonVariant, string> = {
  // Deep Navy es el color principal e interactivo
  primary:
    "text-white bg-[linear-gradient(135deg,#0D1B2A,#1a3347)] hover:brightness-110 shadow-brand",
  // Sage Teal como acento
  accent:
    "text-white bg-brand-teal hover:brightness-105 shadow-teal",
  secondary:
    "text-brand-navy bg-brand-mist hover:bg-brand-mist/70",
  outline:
    "text-brand-navy border border-brand-navy/20 bg-white hover:bg-brand-navy/5",
  ghost:
    "text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/5",
  danger:
    "text-red-600 border border-red-100 bg-red-50 hover:bg-red-100",
};

const buttonSizeClass: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-2xl px-5 text-sm",
};

const baseButton =
  "inline-flex shrink-0 items-center justify-center font-sans font-semibold " +
  "transition-[transform,filter,background-color,border-color] duration-150 ease-out " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40 cursor-pointer";

// ── PremiumButton ──────────────────────────────────────────────────
export function PremiumButton({
  className,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(baseButton, buttonVariantClass[variant], buttonSizeClass[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon aria-hidden="true" className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
}

// ── PremiumIconButton ──────────────────────────────────────────────
export function PremiumIconButton({
  className,
  variant = "outline",
  size = "md",
  icon: Icon,
  label,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  size?: Size;
  icon: LucideIcon;
  label: string;
}) {
  const dim = size === "lg" ? "h-12 w-12 rounded-2xl" : size === "sm" ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-xl";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(baseButton, buttonVariantClass[variant], dim, className)}
      {...props}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

// ── PremiumCard ────────────────────────────────────────────────────
export function PremiumCard({
  className,
  interactive = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white shadow-brand-sm",
        interactive &&
          "transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-brand",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── PremiumInput ───────────────────────────────────────────────────
export const PremiumInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-body text-brand-navy",
      "placeholder:text-slate-300 transition-colors",
      "focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/30",
      "disabled:opacity-50 disabled:pointer-events-none",
      className
    )}
    {...props}
  />
));
PremiumInput.displayName = "PremiumInput";

// ── PremiumBadge ───────────────────────────────────────────────────
type BadgeTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger";

const badgeToneClass: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-500",
  brand: "bg-brand-navy/10 text-brand-navy",
  accent: "bg-brand-mist text-brand-navy",
  success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
};

export function PremiumBadge({
  className,
  tone = "neutral",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-sans font-semibold",
        badgeToneClass[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("py-16 text-center", className)}>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-mist/40">
        <Icon size={26} className="text-brand-teal" aria-hidden="true" />
      </div>
      <p className="font-sans font-semibold text-brand-navy">{title}</p>
      {description && <p className="mt-1 text-sm font-body text-slate-400">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

// ── LoadingState ───────────────────────────────────────────────────
export function LoadingState({
  label = "Cargando...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <Loader2 size={28} className="mb-3 animate-spin text-brand-teal" aria-hidden="true" />
      <p className="text-sm font-body text-slate-400">{label}</p>
    </div>
  );
}

// ── Skeleton (bloque de carga reutilizable) ────────────────────────
export function PremiumSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-slate-100", className)} aria-hidden="true" />;
}
