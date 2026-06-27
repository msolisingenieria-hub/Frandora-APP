import { auth }            from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z }              from "zod";
import { prisma }         from "@/lib/db/client";
import { getBusinessId }  from "@/lib/auth/business";
import { invalidatePublicBusinessCache } from "@/lib/cache/invalidation";
import { revalidatePath } from "next/cache";

const UpdateSchema = z.object({
  primaryColor:      z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor:    z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor:       z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily:        z.enum(["Poppins", "Inter", "Playfair Display", "Montserrat"]).optional(),
  borderRadius:      z.string().optional(),
  heroTitle:         z.string().max(120).nullable().optional(),
  heroSubtitle:      z.string().max(200).nullable().optional(),
  heroImageUrl:      z.string().url().nullable().optional(),
  heroVideoUrl:      z.string().url().nullable().optional(),
  metaTitle:         z.string().max(70).nullable().optional(),
  metaDescription:   z.string().max(160).nullable().optional(),
  servicesLayout:    z.enum(["grid", "list"]).optional(),
  showGallery:       z.boolean().optional(),
  showMap:           z.boolean().optional(),
  showSchedule:      z.boolean().optional(),
  showStaffBios:     z.boolean().optional(),
  showReviews:       z.boolean().optional(),
  showFaq:           z.boolean().optional(),
  cancellationPolicy: z.string().max(600).nullable().optional(),
  mapEmbed:          z.string().nullable().optional(),
  customDomain:      z.string().nullable().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const customization = await prisma.businessCustomization.findUnique({
    where: { businessId },
  });
  return NextResponse.json(customization);
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const updated = await prisma.businessCustomization.upsert({
    where:  { businessId },
    create: { businessId, ...parsed.data },
    update: parsed.data,
  });

  // Invalidar doble: Redis + ISR Next.js
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { slug: true } });
  if (business) {
    await invalidatePublicBusinessCache(business.slug);
    revalidatePath(`/booking/${business.slug}`);
  }

  return NextResponse.json(updated);
}
