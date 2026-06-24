import { Sparkles } from "lucide-react";
import { ServicesGrid } from "@/components/dashboard/services/ServicesGrid";

export const metadata = { title: "Servicios | Frandora" };

export default function ServiciosPage() {
  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles size={18} className="text-brand-teal" />
          <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">Catálogo</p>
        </div>
        <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
          Servicios
        </h1>
        <p className="text-slate-400 text-sm font-body mt-1">
          Define los servicios que ofreces. Aparecen en tu página pública de reservas.
        </p>
      </div>

      <ServicesGrid />
    </div>
  );
}
