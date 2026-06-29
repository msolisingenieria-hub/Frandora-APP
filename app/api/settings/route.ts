import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getBusinessId } from "@/lib/auth/business";
import { getSettings, updateSettings } from "@/lib/services/settings.service";
import { invalidatePublicBusinessCache } from "@/lib/cache/invalidation";

const schema = z.object({
  name:        z.string().min(1).optional(),
  slug:        z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().optional().nullable(),
  phone:       z.string().optional().nullable(),
  website:     z.string().optional().nullable(),
  logoUrl:     z.string().optional().nullable(),
  timezone:    z.string().optional(),
  currency:    z.string().optional(),
  instagram:   z.string().optional().nullable(),
  facebook:    z.string().optional().nullable(),
  tiktok:      z.string().optional().nullable(),
  whatsapp:    z.string().optional().nullable(),
  // Políticas
  bookingAdvanceDays:    z.number().int().min(1).max(365).optional(),
  minCancelHours:        z.number().int().min(0).max(168).optional(),
  bufferMinutes:         z.number().int().min(0).max(120).optional(),
  depositPercent:        z.number().int().min(0).max(100).optional(),
  requirePayment:        z.boolean().optional(),
  autoConfirm:           z.boolean().optional(),
  allowClientCancel:     z.boolean().optional(),
  allowClientReschedule: z.boolean().optional(),
  // Notificaciones
  emailEnabled:          z.boolean().optional(),
  smsEnabled:            z.boolean().optional(),
  whatsappEnabled:       z.boolean().optional(),
  reminder24h:           z.boolean().optional(),
  reminder1h:            z.boolean().optional(),
  reviewRequestEnabled:  z.boolean().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const settings = await getSettings(businessId);
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    await updateSettings(businessId, parsed.data);
    // Render en vivo en la página pública
    const biz = await prisma.business.findUnique({ where: { id: businessId }, select: { slug: true } });
    if (biz) {
      await invalidatePublicBusinessCache(biz.slug).catch(() => null);
      revalidatePath(`/booking/${biz.slug}`);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudieron guardar los cambios";
    const status = message.includes("ya esta en uso") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
