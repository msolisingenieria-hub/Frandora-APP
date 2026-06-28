import { prisma } from "@/lib/db/client";
import { slugify } from "@/lib/utils";
import { addDays } from "date-fns";
import type { OnboardingData } from "@/types/onboarding";

type CompleteOnboardingInput = {
  clerkId: string;
  email: string;
  name: string;
  data: OnboardingData;
};

const PLANS = [
  { tier: "STARTER",      name: "Starter",      monthlyPrice: 19,  annualPrice: 15,  staffLimit: 1,    locationLimit: 1 },
  { tier: "PROFESSIONAL", name: "Professional", monthlyPrice: 49,  annualPrice: 39,  staffLimit: 3,    locationLimit: 1 },
  { tier: "BUSINESS",     name: "Business",     monthlyPrice: 99,  annualPrice: 79,  staffLimit: 10,   locationLimit: 3 },
  { tier: "SCALE",        name: "Scale",        monthlyPrice: 179, annualPrice: 143, staffLimit: null, locationLimit: null },
] as const;

async function ensurePlansExist() {
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { tier: plan.tier as "STARTER" | "PROFESSIONAL" | "BUSINESS" | "SCALE" },
      update: {},
      create: {
        tier: plan.tier as "STARTER" | "PROFESSIONAL" | "BUSINESS" | "SCALE",
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        staffLimit: plan.staffLimit ?? null,
        locationLimit: plan.locationLimit ?? null,
      },
    });
  }
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (await prisma.business.findUnique({ where: { slug } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function completeOnboarding({ clerkId, email, name, data }: CompleteOnboardingInput) {
  await ensurePlansExist();

  // 1. Upsert User — primero por clerkId, si falla por email duplicado actualiza el clerkId
  let user = await prisma.user.findFirst({ where: { OR: [{ clerkId }, { email }] } });
  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { clerkId, name, email, role: "BUSINESS_OWNER" },
    });
  } else {
    user = await prisma.user.create({ data: { clerkId, email, name, role: "BUSINESS_OWNER" } });
  }

  // 2. Create Business
  const slug = await uniqueSlug(slugify(data.businessName));
  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: data.businessName,
      slug,
      category: data.category as Parameters<typeof prisma.business.create>[0]["data"]["category"],
      phone: data.phone || null,
      description: data.description || null,
      email,
    },
  });

  // 3. Location + schedules
  const location = await prisma.businessLocation.create({
    data: {
      businessId: business.id,
      name: data.businessName,
      address: data.address || "",
      city: data.city,
      country: "CL",
      isMain: true,
    },
  });

  await prisma.locationSchedule.createMany({
    data: Object.entries(data.schedule).map(([day, sched]) => ({
      locationId: location.id,
      dayOfWeek: Number(day),
      openTime: sched.openTime,
      closeTime: sched.closeTime,
      isClosed: !sched.isOpen,
    })),
  });

  // 4. Settings + Customization
  await prisma.businessSettings.create({ data: { businessId: business.id } });
  await prisma.businessCustomization.create({
    data: { businessId: business.id, primaryColor: "#0D1B2A", secondaryColor: "#6FA89E" },
  });

  // 5. Services
  const category = await prisma.serviceCategory.create({
    data: { businessId: business.id, name: "Servicios", color: "#0D1B2A" },
  });

  const validServices = data.services.filter((s) => s.name.trim() && s.price > 0);
  if (validServices.length > 0) {
    await prisma.service.createMany({
      data: validServices.map((s) => ({
        businessId: business.id,
        categoryId: category.id,
        name: s.name,
        duration: s.duration,
        price: s.price,
      })),
    });
  }

  // 6. Staff (owner)
  await prisma.staffMember.create({
    data: {
      businessId: business.id,
      userId: user.id,
      locationId: location.id,
      name,
      role: "BUSINESS_OWNER",
      color: "#0D1B2A",
    },
  });

  // 7. Subscription (trial)
  const plan = await prisma.plan.findUnique({
    where: { tier: data.planTier as "STARTER" | "PROFESSIONAL" | "BUSINESS" | "SCALE" },
  });
  if (plan) {
    const now = new Date();
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        planId: plan.id,
        status: "TRIALING",
        currentPeriodStart: now,
        currentPeriodEnd: addDays(now, 14),
        trialEndsAt: addDays(now, 14),
        isAnnual: data.isAnnual,
      },
    });
  }

  return { businessId: business.id, slug };
}
