import { auth }            from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z }              from "zod";
import { prisma }         from "@/lib/db/client";
import { getBusinessId }  from "@/lib/auth/business";
import { invalidatePublicBusinessCache } from "@/lib/cache/invalidation";
import { revalidatePath } from "next/cache";

const MAX_GALLERY = 20;

const AddSchema    = z.object({ url:   z.string().url() });
const RemoveSchema = z.object({ url:   z.string().url() });
const ReorderSchema = z.object({ urls: z.array(z.string().url()).max(MAX_GALLERY) });

async function getCustomization(businessId: string) {
  return prisma.businessCustomization.upsert({
    where:  { businessId },
    create: { businessId },
    update: {},
    select: { galleryUrls: true },
  });
}

async function invalidate(businessId: string) {
  const biz = await prisma.business.findUnique({ where: { id: businessId }, select: { slug: true } });
  if (biz) {
    await invalidatePublicBusinessCache(biz.slug);
    revalidatePath(`/booking/${biz.slug}`);
  }
}

// GET — devuelve la galería actual
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const c = await getCustomization(businessId);
  return NextResponse.json({ urls: c.galleryUrls });
}

// POST — agregar foto a la galería
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = AddSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "URL inválida" }, { status: 400 });

  const c = await getCustomization(businessId);
  if (c.galleryUrls.length >= MAX_GALLERY) {
    return NextResponse.json({ error: `Máximo ${MAX_GALLERY} fotos permitidas` }, { status: 400 });
  }

  const updated = await prisma.businessCustomization.update({
    where: { businessId },
    data:  { galleryUrls: [...c.galleryUrls, parsed.data.url] },
    select: { galleryUrls: true },
  });
  await invalidate(businessId);
  return NextResponse.json({ urls: updated.galleryUrls });
}

// DELETE — eliminar una foto
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = RemoveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "URL inválida" }, { status: 400 });

  const c = await getCustomization(businessId);
  const updated = await prisma.businessCustomization.update({
    where: { businessId },
    data:  { galleryUrls: c.galleryUrls.filter((u) => u !== parsed.data.url) },
    select: { galleryUrls: true },
  });
  await invalidate(businessId);
  return NextResponse.json({ urls: updated.galleryUrls });
}

// PATCH — reordenar galería
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = ReorderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const updated = await prisma.businessCustomization.update({
    where: { businessId },
    data:  { galleryUrls: parsed.data.urls },
    select: { galleryUrls: true },
  });
  await invalidate(businessId);
  return NextResponse.json({ urls: updated.galleryUrls });
}
