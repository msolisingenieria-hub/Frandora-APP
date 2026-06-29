import { auth }            from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z }              from "zod";
import { prisma }         from "@/lib/db/client";
import { getBusinessId }  from "@/lib/auth/business";
import { invalidatePublicBusinessCache } from "@/lib/cache/invalidation";
import { revalidatePath } from "next/cache";
import { hexToHsl }       from "@/lib/theme/hexToHsl";

const UpdateSchema = z.object({
  primaryColor:      z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor:    z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor:       z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily:        z.enum(["Poppins", "Inter", "Playfair Display", "Montserrat", "Lato", "Nunito"]).nullable().optional(),
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
  // Sistema de temas
  themeMode:          z.enum(["light", "dark", "auto"]).optional(),
  densityPreset:      z.enum(["compact", "normal", "spacious"]).optional(),
  borderRadiusPreset: z.enum(["sharp", "rounded", "pill"]).optional(),
  dashboardBgType:    z.enum(["solid", "gradient", "image"]).optional(),
  dashboardBgValue:   z.string().nullable().optional(),
  primaryColorHsl:    z.string().optional(),
  accentColorHsl:     z.string().optional(),
  secondaryColorHsl:  z.string().optional(),
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

  // Calcular HSL automáticamente desde los hex para el sistema de temas
  const data = { ...parsed.data } as Record<string, unknown>;
  if (parsed.data.primaryColor)   data.primaryColorHsl   = hexToHsl(parsed.data.primaryColor);
  if (parsed.data.accentColor)    data.accentColorHsl    = hexToHsl(parsed.data.accentColor);
  if (parsed.data.secondaryColor) data.secondaryColorHsl = hexToHsl(parsed.data.secondaryColor);
  // fontFamily es NOT NULL en la DB: "Por defecto" (null) → usar Inter
  if (data.fontFamily === null) data.fontFamily = "Inter";

  const updated = await prisma.businessCustomization.upsert({
    where:  { businessId },
    // En el create Prisma exige la relación `business` (connect), no el escalar businessId.
    create: { business: { connect: { id: businessId } }, ...data },
    update: data,
  });

  // Invalidar doble: Redis + ISR Next.js
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { slug: true } });
  if (business) {
    await invalidatePublicBusinessCache(business.slug);
    revalidatePath(`/booking/${business.slug}`);
  }

  return NextResponse.json(updated);
}
