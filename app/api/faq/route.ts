import { auth }            from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z }              from "zod";
import { prisma }         from "@/lib/db/client";
import { getBusinessId }  from "@/lib/auth/business";
import { invalidatePublicBusinessCache } from "@/lib/cache/invalidation";
import { revalidatePath } from "next/cache";
import type { Prisma }    from "@prisma/client";

const FaqSchema = z.object({
  question: z.string().min(3).max(200),
  answer:   z.string().min(3).max(800),
});

const FaqsSchema = z.array(FaqSchema).max(20);

type FAQ = z.infer<typeof FaqSchema>;

function parseFaqs(raw: Prisma.JsonValue): FAQ[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (f): f is FAQ =>
      typeof f === "object" && f !== null &&
      typeof (f as Record<string, unknown>).question === "string" &&
      typeof (f as Record<string, unknown>).answer   === "string"
  );
}

async function invalidate(businessId: string) {
  const biz = await prisma.business.findUnique({ where: { id: businessId }, select: { slug: true } });
  if (biz) {
    await invalidatePublicBusinessCache(biz.slug);
    revalidatePath(`/booking/${biz.slug}`);
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const c = await prisma.businessCustomization.findUnique({
    where:  { businessId },
    select: { faqs: true },
  });
  return NextResponse.json({ faqs: parseFaqs(c?.faqs ?? []) });
}

// PUT — reemplaza todas las FAQs (para guardar el orden + ediciones completas)
export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = FaqsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  await prisma.businessCustomization.upsert({
    where:  { businessId },
    create: { businessId, faqs: parsed.data as unknown as Prisma.InputJsonValue },
    update: { faqs: parsed.data as unknown as Prisma.InputJsonValue },
  });

  await invalidate(businessId);
  return NextResponse.json({ faqs: parsed.data });
}
