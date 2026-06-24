import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { getClients, createClient } from "@/lib/services/client.service";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  birthdate: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  preferences: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional().nullable(),
});

async function getBusinessId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { ownedBusinesses: { select: { id: true }, take: 1 } },
  });
  return user?.ownedBusinesses[0]?.id ?? null;
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const page = Number(searchParams.get("page") ?? 1);

  const result = await getClients(businessId, search, page);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const client = await createClient({ businessId, ...parsed.data });
  return NextResponse.json(client, { status: 201 });
}
