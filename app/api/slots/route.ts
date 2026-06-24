import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/services/slots.service";

const QuerySchema = z.object({
  businessId: z.string().min(1),
  serviceId:  z.string().min(1),
  date:       z.string().min(1), // "YYYY-MM-DD"
  staffId:    z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const parsed = QuerySchema.safeParse({
    businessId: searchParams.get("businessId"),
    serviceId:  searchParams.get("serviceId"),
    date:       searchParams.get("date"),
    staffId:    searchParams.get("staffId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  try {
    const { businessId, serviceId, date, staffId } = parsed.data;
    const slots = await getAvailableSlots({
      businessId,
      serviceId,
      staffId: staffId ?? null,
      date: new Date(date + "T12:00:00"),
    });
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("[slots] GET error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
