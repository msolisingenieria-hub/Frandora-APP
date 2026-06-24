import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getTimeBlocks, createTimeBlock, TimeBlockSchema } from "@/lib/services/time-block.service";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const from = new Date(searchParams.get("from") ?? new Date().toISOString());
  const to   = new Date(searchParams.get("to")   ?? new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString());

  const blocks = await getTimeBlocks(businessId, from, to);
  return NextResponse.json(blocks);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body   = await req.json();
  const parsed = TimeBlockSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const block = await createTimeBlock(businessId, parsed.data);
  return NextResponse.json(block, { status: 201 });
}
