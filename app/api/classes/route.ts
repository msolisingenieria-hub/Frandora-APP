import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessId } from "@/lib/auth/business";
import { getGroupClasses, createGroupClass, GroupClassSchema } from "@/lib/services/group-class.service";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : startOfMonth(new Date());
  const to   = searchParams.get("to")   ? new Date(searchParams.get("to")!)   : endOfMonth(addMonths(new Date(), 1));

  const classes = await getGroupClasses(businessId, from, to);
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const body   = await req.json();
  const parsed = GroupClassSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const newClass = await createGroupClass(businessId, parsed.data);
  return NextResponse.json(newClass, { status: 201 });
}
