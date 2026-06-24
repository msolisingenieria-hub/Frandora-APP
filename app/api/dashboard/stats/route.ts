import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getBusinessId } from "@/lib/auth/business";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = await getBusinessId(userId);
  if (!businessId) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay   = new Date(now); endOfDay.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [todayAppointments, totalClients, monthlyRevenue] = await Promise.all([
    prisma.appointment.count({
      where: {
        businessId,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ["CANCELED", "NO_SHOW"] },
      },
    }),
    prisma.client.count({ where: { businessId } }),
    prisma.payment.aggregate({
      where: {
        businessId,
        status: "COMPLETED",
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { total: true },
    }),
  ]);

  return NextResponse.json({
    todayAppointments,
    totalClients,
    monthlyRevenue: monthlyRevenue._sum.total ?? 0,
  });
}
