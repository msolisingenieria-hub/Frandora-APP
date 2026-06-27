"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  urls: string[];
  businessName: string;
};

export function PublicGallery({ urls, businessName }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  if (urls.length === 0) return null;

  return (
    <section className="px-4 md:px-10 py-8 md:py-10">
      <h2 className="font-sans font-bold text-brand-navy text-xl md:text-2xl mb-5">Galería</h2>

      {/* Scroll horizontal en mobile, grid en desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">
        {urls.map((url, i) => (
          <button
            key={url}
            onClick={() => setSelected(url)}
            className="flex-none w-52 md:w-auto aspect-[4/3] rounded-2xl overflow-hidden snap-start
              cursor-pointer relative group"
            aria-label={`Ver foto ${i + 1} de ${businessName}`}
          >
            <Image
              src={url}
              alt={`${businessName} — foto ${i + 1}`}
              fill
              sizes="(max-width: 768px) 208px, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Cerrar imagen"
          >
            <X size={20} />
          </button>
          <div className="relative max-w-4xl w-full max-h-[85vh] aspect-video">
            <Image
              src={selected}
              alt="Foto ampliada"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </section>
  );
}
