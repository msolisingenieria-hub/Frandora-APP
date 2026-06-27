"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, StickyNote } from "lucide-react";

export function BusinessNoteForm({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/businesses/${businessId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      setContent("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-start gap-2">
        <StickyNote size={14} className="text-slate-400 mt-2.5 shrink-0" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Agregar nota interna sobre este negocio..."
          rows={2}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-body text-slate-800 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/20"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-sans font-semibold text-white transition-[opacity,transform] active:scale-[0.97] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : null}
          Guardar nota
        </button>
      </div>
    </form>
  );
}
