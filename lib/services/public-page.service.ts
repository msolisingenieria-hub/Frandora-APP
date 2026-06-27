import { prisma } from "@/lib/db/client";
import type {
  PublicPageData,
  PublicCustomization,
  PublicFAQ,
  PublicRatingStats,
} from "@/types/public-page";

const DEFAULT_CUSTOMIZATION: PublicCustomization = {
  primaryColor: "#0D1B2A",
  secondaryColor: "#6FA89E",
  accentColor: "#CFE3DF",
  fontFamily: "Poppins",
  borderRadius: "0.75rem",
  heroTitle: null,
  heroSubtitle: null,
  heroImageUrl: null,
  heroVideoUrl: null,
  galleryUrls: [],
  metaTitle: null,
  metaDescription: null,
  servicesLayout: "grid",
  showGallery: true,
  showMap: true,
  showSchedule: true,
  showStaffBios: true,
  showReviews: true,
  showFaq: true,
  cancellationPolicy: null,
  faqs: [],
  mapEmbed: null,
  customDomain: null,
};

function buildRatingStats(ratings: number[]): PublicRatingStats {
  if (ratings.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  for (const r of ratings) {
    const key = Math.min(5, Math.max(1, r)) as 1 | 2 | 3 | 4 | 5;
    distribution[key]++;
  }
  const average = ratings.reduce((s, r) => s + r, 0) / ratings.length;
  return { average: Math.round(average * 10) / 10, total: ratings.length, distribution };
}

function parseFaqs(raw: unknown): PublicFAQ[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (f): f is PublicFAQ =>
      typeof f === "object" && f !== null &&
      typeof (f as Record<string, unknown>).question === "string" &&
      typeof (f as Record<string, unknown>).answer === "string"
  );
}

export async function getPublicPageData(slug: string): Promise<PublicPageData | null> {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      locations: {
        where: { isMain: true },
        include: { schedules: { orderBy: { dayOfWeek: "asc" } } },
        take: 1,
      },
      services: {
        where: { isActive: true, isOnline: true },
        include: { category: { select: { name: true } } },
        orderBy: { order: "asc" },
      },
      staff: {
        where: { isActive: true },
        include: { services: { select: { serviceId: true } } },
        orderBy: { name: "asc" },
      },
      reviews: {
        where: { isPublic: true, isVerified: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          rating: true,
          comment: true,
          clientName: true,
          createdAt: true,
        },
      },
      customization: true,
      settings: true,
    },
  });

  if (!business) return null;

  const location = business.locations[0] ?? null;
  const c = business.customization;

  const customization: PublicCustomization = c
    ? {
        primaryColor: c.primaryColor,
        secondaryColor: c.secondaryColor,
        accentColor: c.accentColor,
        fontFamily: c.fontFamily,
        borderRadius: c.borderRadius,
        heroTitle: c.heroTitle,
        heroSubtitle: c.heroSubtitle,
        heroImageUrl: c.heroImageUrl,
        heroVideoUrl: c.heroVideoUrl,
        galleryUrls: c.galleryUrls,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
        servicesLayout: c.servicesLayout,
        showGallery: c.showGallery,
        showMap: c.showMap,
        showSchedule: c.showSchedule,
        showStaffBios: c.showStaffBios,
        showReviews: c.showReviews,
        showFaq: c.showFaq,
        cancellationPolicy: c.cancellationPolicy,
        faqs: parseFaqs(c.faqs),
        mapEmbed: c.mapEmbed,
        customDomain: c.customDomain,
      }
    : DEFAULT_CUSTOMIZATION;

  const ratings = business.reviews.map((r) => r.rating);
  const ratingStats = buildRatingStats(ratings);

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    logoUrl: business.logoUrl ?? null,
    coverUrl: business.bannerUrl ?? null,
    address: location?.address ?? null,
    city: location?.city ?? null,
    phone: business.phone,
    email: business.email,
    website: business.website,
    currency: business.settings?.currency ?? "CLP",
    timezone: business.settings?.timezone ?? "America/Santiago",
    services: business.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      color: s.color,
      imageUrl: s.imageUrl ?? null,
      categoryName: s.category?.name ?? null,
    })),
    staff: business.staff.map((m) => ({
      id: m.id,
      name: m.name,
      avatarUrl: m.avatarUrl,
      bio: m.bio,
      specialties: m.specialties,
      serviceIds: m.services.map((ss) => ss.serviceId),
    })),
    schedule: (location?.schedules ?? []).map((sc) => ({
      dayOfWeek: sc.dayOfWeek,
      openTime: sc.openTime,
      closeTime: sc.closeTime,
      isClosed: sc.isClosed,
    })),
    reviews: business.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      clientName: r.clientName,
      createdAt: r.createdAt.toISOString(),
    })),
    ratingStats,
    customization,
  };
}
