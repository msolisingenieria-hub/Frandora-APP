import type { BusinessStatus } from "@prisma/client";

const CONFIG: Record<BusinessStatus, { label: string; className: string }> = {
  ACTIVE:    { label: "Activo",    className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  SUSPENDED: { label: "Suspendido", className: "bg-amber-50  text-amber-700  ring-amber-200" },
  CANCELED:  { label: "Cancelado", className: "bg-rose-50   text-rose-700   ring-rose-200" },
};

export function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  const c = CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-sans font-semibold ring-1 ${c.className}`}>
      {c.label}
    </span>
  );
}
