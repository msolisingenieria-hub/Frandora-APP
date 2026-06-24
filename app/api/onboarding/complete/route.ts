import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { completeOnboarding } from "@/lib/services/onboarding.service";

const daySchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
});

const serviceSchema = z.object({
  tempId: z.string(),
  name: z.string(),
  duration: z.number().int().positive(),
  price: z.number().min(0),
});

const schema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  category: z.string().min(1),
  categoryLabel: z.string(),
  businessName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().optional().default(""),
  city: z.string().min(1),
  description: z.string().optional().default(""),
  services: z.array(serviceSchema),
  schedule: z.record(z.string(), daySchema),
  planTier: z.enum(["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE"]),
  isAnnual: z.boolean(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { clerkId, email, name, ...data } = parsed.data;

  // Convert schedule keys from string to number
  const schedule = Object.fromEntries(
    Object.entries(data.schedule).map(([k, v]) => [Number(k), v])
  ) as Record<number, { isOpen: boolean; openTime: string; closeTime: string }>;

  try {
    const result = await completeOnboarding({
      clerkId,
      email,
      name,
      data: { ...data, schedule },
    });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[onboarding/complete]", err);
    return NextResponse.json({ error: "Error al crear el negocio" }, { status: 500 });
  }
}
