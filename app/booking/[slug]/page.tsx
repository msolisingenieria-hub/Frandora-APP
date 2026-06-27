import { notFound }   from "next/navigation";
import type { Metadata } from "next";
import { getPublicPageData } from "@/lib/services/public-page.service";
import { PublicPageLayout }  from "@/components/public-page/PublicPageLayout";

export const revalidate = 300; // ISR — revalidar cada 5 min

type Props = {
  params: { slug: string };
};

// ── Metadata dinámica por negocio ───────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPublicPageData(params.slug);
  if (!data) return { title: "Negocio no encontrado" };

  const title       = data.customization.metaTitle       ?? `Reservar en ${data.name}`;
  const description = data.customization.metaDescription ?? data.description ?? `Reserva un servicio en ${data.name} — online, gratis y en segundos.`;
  const image       = data.customization.heroImageUrl    ?? data.coverUrl ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

// ── JSON-LD Schema.org ──────────────────────────────────────────────────────

function buildJsonLd(data: Awaited<ReturnType<typeof getPublicPageData>>) {
  if (!data) return null;

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":    "LocalBusiness",
    name:       data.name,
    description: data.description,
    telephone:  data.phone,
    email:      data.email,
    url:        data.website ?? `https://${data.slug}.frandora.cl`,
    ...(data.address ? {
      address: {
        "@type":           "PostalAddress",
        streetAddress:     data.address,
        addressLocality:   data.city,
        addressCountry:    "CL",
      },
    } : {}),
    ...(data.ratingStats.total > 0 ? {
      aggregateRating: {
        "@type":       "AggregateRating",
        ratingValue:   data.ratingStats.average.toFixed(1),
        reviewCount:   data.ratingStats.total,
        bestRating:    5,
        worstRating:   1,
      },
    } : {}),
    hasOfferCatalog: {
      "@type":       "OfferCatalog",
      name:          "Servicios",
      itemListElement: data.services.map((s) => ({
        "@type":       "Offer",
        itemOffered: {
          "@type":   "Service",
          name:       s.name,
          description: s.description,
        },
        price:       s.price,
        priceCurrency: data.currency,
      })),
    },
  };

  if (data.customization.faqs.length > 0) {
    return [
      base,
      {
        "@context": "https://schema.org",
        "@type":    "FAQPage",
        mainEntity: data.customization.faqs.map((f) => ({
          "@type":          "Question",
          name:             f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text:    f.answer,
          },
        })),
      },
    ];
  }

  return base;
}

// ── Página ──────────────────────────────────────────────────────────────────

export default async function PublicBusinessPage({ params }: Props) {
  const data = await getPublicPageData(params.slug);
  if (!data) notFound();

  const jsonLd = buildJsonLd(data);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PublicPageLayout data={data} />
    </>
  );
}
