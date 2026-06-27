import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "navy" | "teal" | "amber" | "rose";
}

const TONES: Record<NonNullable<MetricCardProps["tone"]>, { ring: string; bg: string; icon: string }> = {
  navy:  { ring: "ring-brand-navy/10",  bg: "bg-brand-navy/5",   icon: "text-brand-navy" },
  teal:  { ring: "ring-brand-teal/20",  bg: "bg-brand-teal/10",  icon: "text-brand-teal" },
  amber: { ring: "ring-amber-500/15",   bg: "bg-amber-500/10",   icon: "text-amber-600" },
  rose:  { ring: "ring-rose-500/15",    bg: "bg-rose-500/10",    icon: "text-rose-600" },
};

export function MetricCard({ label, value, hint, icon: Icon, tone = "navy" }: MetricCardProps) {
  const t = TONES[tone];
  return (
    <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-sans font-semibold tracking-[0.12em] uppercase text-slate-400">
          {label}
        </p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${t.ring} ${t.bg} shrink-0`}>
          <Icon size={16} className={t.icon} />
        </span>
      </div>
      <p className="mt-3 font-sans text-2xl font-semibold tracking-tight text-brand-navy md:text-[28px]">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs font-body text-slate-400">{hint}</p>}
    </div>
  );
}
