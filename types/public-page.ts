// Tipos de la página pública premium (Fase 12)

export type PublicFAQ = {
  question: string;
  answer: string;
};

export type PublicCustomization = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
  galleryUrls: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  servicesLayout: string;
  showGallery: boolean;
  showMap: boolean;
  showSchedule: boolean;
  showStaffBios: boolean;
  showReviews: boolean;
  showFaq: boolean;
  cancellationPolicy: string | null;
  faqs: PublicFAQ[];
  mapEmbed: string | null;
  customDomain: string | null;
};

export type PublicServiceFull = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  color: string;
  imageUrl: string | null;
  categoryName: string | null;
};

export type PublicStaffFull = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  specialties: string[];
  serviceIds: string[];
};

export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  clientName: string;
  createdAt: string;
};

export type PublicRatingStats = {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type PublicDaySchedule = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export type PublicPageData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  currency: string;
  timezone: string;
  services: PublicServiceFull[];
  staff: PublicStaffFull[];
  schedule: PublicDaySchedule[];
  reviews: PublicReview[];
  ratingStats: PublicRatingStats;
  customization: PublicCustomization;
};
