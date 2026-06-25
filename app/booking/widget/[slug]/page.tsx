// Página pública embebible — se carga dentro de un iframe en el sitio del negocio
// URL: https://[slug].frandora.cl/widget/[slug] (en producción se resuelve por subdominio)
// Esto renderiza el formulario de reserva en modo compacto sin el layout del dashboard

import { prisma } from "@/lib/db/client";
import { businessUrl } from "@/lib/urls";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Reservar",
  robots: { index: false },
};

export default async function WidgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!business) redirect("/");

  // El widget redirige al flujo de reserva completo en la misma ventana/iframe
  const bookingUrl = businessUrl(slug);

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Inter', sans-serif", background: "transparent" }}>
      <div style={{
        background: "linear-gradient(135deg, #0D1B2A, #1a3347)",
        borderRadius: "16px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 8px 32px rgba(13,27,42,0.25)",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#CFE3DF", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
            Reserva online
          </p>
          <p style={{ color: "#fff", fontSize: "18px", fontWeight: 700, fontFamily: "'Poppins', sans-serif", margin: "4px 0 0" }}>
            {business.name}
          </p>
        </div>
        <a href={bookingUrl} target="_blank" rel="noreferrer" style={{
          display: "block",
          width: "100%",
          padding: "12px 24px",
          background: "#6FA89E",
          color: "#fff",
          borderRadius: "10px",
          fontWeight: 700,
          fontSize: "14px",
          textAlign: "center",
          textDecoration: "none",
          transition: "opacity .15s",
        }}>
          Reservar hora →
        </a>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", margin: 0 }}>
          Powered by <strong style={{ color: "rgba(255,255,255,0.55)" }}>Frandora</strong>
        </p>
      </div>
    </div>
  );
}
