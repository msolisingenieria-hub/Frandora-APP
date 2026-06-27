"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PublicFAQ } from "@/types/public-page";

type Props = {
  faqs: PublicFAQ[];
};

function FaqItem({ faq, index }: { faq: PublicFAQ; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left py-4 px-5 cursor-pointer
          hover:bg-slate-50/60 transition-colors duration-150 rounded-2xl"
        aria-expanded={open}
        aria-controls={`faq-${index}`}
      >
        <span className="font-sans font-semibold text-brand-navy text-sm pr-4">{faq.question}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={`faq-${index}`}
        className={`overflow-hidden transition-all duration-200 ease-out ${open ? "max-h-96" : "max-h-0"}`}
      >
        <p className="px-5 pb-4 font-body text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

export function PublicFaq({ faqs }: Props) {
  if (faqs.length === 0) return null;

  return (
    <section id="preguntas" className="px-4 md:px-10 py-8 md:py-10">
      <h2 className="font-sans font-bold text-brand-navy text-xl md:text-2xl mb-5">Preguntas frecuentes</h2>
      <div className="max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-brand-sm overflow-hidden">
        {faqs.map((faq, i) => (
          <FaqItem key={i} faq={faq} index={i} />
        ))}
      </div>
    </section>
  );
}
