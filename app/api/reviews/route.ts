import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getReviews, createReview, ReviewSchema } from "@/lib/services/review.service";
import { z } from "zod";

// GET — panel del negocio (requiere auth)
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const reviews = await getReviews(businessId);
  return NextResponse.json(reviews);
}

const PublicReviewSchema = ReviewSchema.extend({
  businessId: z.string().min(1),
});

// POST — formulario público de reseña (sin auth)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = PublicReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { businessId, ...reviewData } = parsed.data;

  try {
    const review = await createReview(businessId, reviewData);
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al guardar opinión";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
