import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessId } from "@/lib/auth/business";
import { getSettings, updateSettings } from "@/lib/services/settings.service";

const schema = z.object({
  name:        z.string().min(1).optional(),
  slug:        z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().optional().nullable(),
  phone:       z.string().optional().nullable(),
  website:     z.string().optional().nullable(),
  timezone:    z.string().optional(),
  instagram:   z.string().optional().nullable(),
  facebook:    z.string().optional().nullable(),
  tiktok:      z.string().optional().nullable(),
  whatsapp:    z.string().optional().nullable(),
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
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudieron guardar los cambios";
    const status = message.includes("ya esta en uso") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
