"use client";

import type { ReactNode } from "react";

export function SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5 md:p-6">
      <div className="mb-5">
        <h2 className="text-brand-navy font-sans font-semibold text-sm">{title}</h2>
        {description && <p className="text-slate-400 text-xs font-body mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function TextField({ label, value, onChange, type = "text", placeholder, icon: Icon, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon?: React.ElementType; prefix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-sans font-semibold text-slate-500 mb-1.5">{label}</label>
      {prefix ? (
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-brand-teal/30 focus-within:border-brand-teal transition-colors">
          <span className="px-3 py-2.5 text-xs text-slate-400 font-body border-r border-slate-200 whitespace-nowrap bg-slate-100">{prefix}</span>
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="flex-1 px-3 py-2.5 text-sm bg-slate-50 font-body text-brand-navy focus:outline-none min-w-0" />
        </div>
      ) : (
        <div className="relative">
          {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy transition-colors`} />
        </div>
      )}
    </div>
  );
}

export function ToggleRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 py-2.5 text-left group">
      <div className="min-w-0">
        <p className="text-sm font-sans font-medium text-brand-navy">{label}</p>
        {description && <p className="text-xs font-body text-slate-400 mt-0.5">{description}</p>}
      </div>
      <span className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-brand-teal" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-150 ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function NumberStepper({ label, value, onChange, min = 0, max = 999, step = 1, suffix }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; suffix?: string;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <p className="text-sm font-sans font-medium text-brand-navy">{label}</p>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button type="button" onClick={() => onChange(clamp(value - step))}
          className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center text-sm font-bold transition-colors">−</button>
        <span className="w-16 text-center text-sm font-sans font-semibold text-brand-navy tabular-nums">
          {value}{suffix && <span className="text-slate-400 text-xs ml-0.5">{suffix}</span>}
        </span>
        <button type="button" onClick={() => onChange(clamp(value + step))}
          className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center text-sm font-bold transition-colors">+</button>
      </div>
    </div>
  );
}
