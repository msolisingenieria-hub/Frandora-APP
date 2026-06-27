"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  flagId: string;
  field: "enabledForAll" | "isActive";
  value: boolean;
  label: string;
}

export function FeatureFlagToggle({ flagId, field, value, label }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(value);

  async function toggle() {
    setLoading(true);
    const next = !current;
    try {
      await fetch(`/api/admin/feature-flags/${flagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      setCurrent(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={label}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal/40 ${current ? "bg-brand-teal" : "bg-slate-200"}`}
    >
      {loading ? (
        <Loader2 size={10} className="absolute left-1/2 -translate-x-1/2 animate-spin text-white" />
      ) : (
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${current ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      )}
    </button>
  );
}
