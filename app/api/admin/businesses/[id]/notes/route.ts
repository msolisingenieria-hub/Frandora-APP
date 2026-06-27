import { NextRequest, NextResponse } from "next/server";
import { getSuperAdmin } from "@/lib/auth/admin";
import { addBusinessNote } from "@/lib/services/admin-businesses.service";
import { z } from "zod";

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nota inválida" }, { status: 400 });

  await addBusinessNote(params.id, parsed.data.content, admin.id);
  return NextResponse.json({ ok: true });
}
