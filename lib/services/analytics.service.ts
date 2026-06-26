import { prisma } from "@/lib/db/client";

function startOf(unit: "day" | "week" | "month" | "year", d = new Date()) {
  const r = new Date(d);
  if (unit === "day")   { r.setHours(0,0,0,0); return r; }
  if (unit === "week")  { r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); r.setHours(0,0,0,0); return r; }
  if (unit === "month") { r.setDate(1); r.setHours(0,0,0,0); return r; }
  r.setMonth(0,1); r.setHours(0,0,0,0); return r;
}

function prevPeriod(from: Date, to: Date) {
  const diff = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - diff), to: new Date(from) };
}

export async function getOverviewStats(businessId: string) {
  const now        = new Date();
  const monthStart = startOf("month");
  const dayStart   = startOf("day");
  const prev       = prevPeriod(monthStart, now);

  const [todayAppts, monthAppts, prevAppts, totalClients, newClients, completedMonth] = await Promise.all([
    prisma.appointment.count({ where: { businessId, startTime: { gte: dayStart }, status: { not: "CANCELED" } } }),
    prisma.appointment.count({ where: { businessId, startTime: { gte: monthStart }, status: { not: "CANCELED" } } }),
    prisma.appointment.count({ where: { businessId, startTime: { gte: prev.from, lt: prev.to }, status: { not: "CANCELED" } } }),
    prisma.client.count({ where: { businessId } }),
    prisma.client.count({ where: { businessId, createdAt: { gte: monthStart } } }),
    prisma.appointment.findMany({
      where: { businessId, startTime: { gte: monthStart }, status: "COMPLETED" },
      select: { totalPrice: true },
    }),
  ]);

  const monthRevenue  = completedMonth.reduce((s, a) => s + a.totalPrice, 0);
  const avgTicket     = completedMonth.length > 0 ? monthRevenue / completedMonth.length : 0;
  const apptGrowth    = prevAppts > 0 ? ((monthAppts - prevAppts) / prevAppts) * 100 : 0;

  const canceledMonth = await prisma.appointment.count({ where: { businessId, startTime: { gte: monthStart }, status: "CANCELED" } });
  const totalMonth    = monthAppts + canceledMonth;
  const cancelRate    = totalMonth > 0 ? (canceledMonth / totalMonth) * 100 : 0;

  return { todayAppts, monthAppts, apptGrowth, monthRevenue, avgTicket, totalClients, newClients, cancelRate };
}

export async function getRevenueByDay(businessId: string, from: Date, to: Date) {
  const appts = await prisma.appointment.findMany({
    where: { businessId, startTime: { gte: from, lte: to }, status: "COMPLETED" },
    select: { startTime: true, totalPrice: true },
    orderBy: { startTime: "asc" },
  });

  const map = new Map<string, number>();
  for (const a of appts) {
    const day = a.startTime.toISOString().slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + a.totalPrice);
  }

  const result: { date: string; revenue: number }[] = [];
  const cur = new Date(from);
  while (cur <= to) {
    const day = cur.toISOString().slice(0, 10);
    result.push({ date: day, revenue: map.get(day) ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

export async function getTopServices(businessId: string, from: Date, to: Date, limit = 6) {
  const items = await prisma.appointmentService.findMany({
    where: { appointment: { businessId, startTime: { gte: from, lte: to }, status: "COMPLETED" } },
    include: { service: { select: { name: true } } },
  });

  const map = new Map<string, { name: string; count: number; revenue: number }>();
  for (const i of items) {
    const key = i.serviceId;
    const cur = map.get(key) ?? { name: i.service.name, count: 0, revenue: 0 };
    cur.count++;
    cur.revenue += i.price ?? 0;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export async function getTopStaff(businessId: string, from: Date, to: Date, limit = 5) {
  const appts = await prisma.appointment.findMany({
    where: { businessId, startTime: { gte: from, lte: to }, status: "COMPLETED", staffId: { not: null } },
    select: { totalPrice: true, staffId: true, staff: { select: { name: true, color: true } } },
  });

  const map = new Map<string, { name: string; color: string; count: number; revenue: number }>();
  for (const a of appts) {
    if (!a.staffId || !a.staff) continue;
    const cur = map.get(a.staffId) ?? { name: a.staff.name, color: a.staff.color, count: 0, revenue: 0 };
    cur.count++;
    cur.revenue += a.totalPrice;
    map.set(a.staffId, cur);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export async function getClientStats(businessId: string, from: Date, to: Date) {
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000);

  const [newCount, returningAppts, atRisk] = await Promise.all([
    prisma.client.count({ where: { businessId, createdAt: { gte: from, lte: to } } }),
    prisma.appointmentClient.groupBy({
      by: ["clientId"],
      where: {
        appointment: { businessId, startTime: { gte: from, lte: to }, status: "COMPLETED" },
      },
      _count: { clientId: true },
      having: { clientId: { _count: { gt: 1 } } },
    }),
    prisma.client.count({
      where: {
        businessId,
        appointments: { none: { appointment: { startTime: { gte: sixtyDaysAgo } } } },
      },
    }),
  ]);

  return { newCount, returningCount: returningAppts.length, atRisk };
}

export async function getHourlyHeatmap(businessId: string, from: Date, to: Date) {
  const appts = await prisma.appointment.findMany({
    where: { businessId, startTime: { gte: from, lte: to }, status: { not: "CANCELED" } },
    select: { startTime: true },
  });

  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const a of appts) {
    const dow  = (a.startTime.getDay() + 6) % 7; // lun=0
    const hour = a.startTime.getHours();
    grid[dow][hour]++;
  }
  return grid;
}
