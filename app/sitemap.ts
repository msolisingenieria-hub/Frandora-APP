import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/client";

export const revalidate = 3600; // regenerar cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const businesses = await prisma.business.findMany({
    where: {
      subscription: {
        status: { in: ["ACTIVE", "TRIALING"] },
      },
    },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });

  const pages: MetadataRoute.Sitemap = businesses.map((b) => ({
    url:             `https://${b.slug}.frandora.cl`,
    lastModified:    b.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  // Página principal de Frandora
  pages.unshift({
    url:             "https://frandora.cl",
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        1,
  });

  return pages;
}
