import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { deleteTimeBlock } from "@/lib/services/time-block.service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await deleteTimeBlock(id);
  return NextResponse.json({ ok: true });
}
