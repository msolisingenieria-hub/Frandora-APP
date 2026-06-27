import { prisma } from "@/lib/db/client";
import { audit } from "@/lib/audit/log";
import type { PlanTier } from "@prisma/client";
import { z } from "zod";

export const featureFlagSchema = z.object({
  name: z.string().min(2).max(64).regex(/^[a-z_]+$/, "Solo letras minúsculas y guiones bajos"),
  description: z.string().optional(),
  scope: z.enum(["ALL", "PLAN", "BUSINESS"]).default("ALL"),
  enabledForAll: z.boolean().default(false),
  rolloutPercent: z.number().int().min(0).max(100).default(0),
  enabledPlans: z.array(z.enum(["STARTER", "PROFESSIONAL", "BUSINESS", "SCALE", "ENTERPRISE"])).default([]),
  isActive: z.boolean().default(true),
});

export async function listFeatureFlags() {
  return prisma.featureFlag.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { overrides: true } } },
  });
}

export async function createFeatureFlag(data: z.infer<typeof featureFlagSchema>, adminId: string) {
  const flag = await prisma.featureFlag.create({
    data: {
      ...data,
      enabledPlans: data.enabledPlans as PlanTier[],
    },
  });
  await audit({ userId: adminId, action: "ADMIN_CREATE_FEATURE_FLAG", resource: "feature_flag", resourceId: flag.id, metadata: { name: flag.name } });
  return flag;
}

export async function updateFeatureFlag(id: string, data: Partial<z.infer<typeof featureFlagSchema>>, adminId: string) {
  const flag = await prisma.featureFlag.update({
    where: { id },
    data: {
      ...data,
      enabledPlans: data.enabledPlans ? (data.enabledPlans as PlanTier[]) : undefined,
    },
  });
  await audit({ userId: adminId, action: "ADMIN_UPDATE_FEATURE_FLAG", resource: "feature_flag", resourceId: id, metadata: data });
  return flag;
}

export async function deleteFeatureFlag(id: string, adminId: string) {
  await prisma.featureFlag.delete({ where: { id } });
  await audit({ userId: adminId, action: "ADMIN_DELETE_FEATURE_FLAG", resource: "feature_flag", resourceId: id });
}

export async function setBusinessOverride(businessId: string, featureName: string, enabled: boolean, adminId: string) {
  const override = await prisma.businessFeatureFlag.upsert({
    where: { businessId_featureName: { businessId, featureName } },
    create: { businessId, featureName, enabled, overriddenBy: adminId },
    update: { enabled, overriddenBy: adminId, overriddenAt: new Date() },
  });
  await audit({ userId: adminId, action: "ADMIN_OVERRIDE_FEATURE_FLAG", resource: "business_feature_flag", resourceId: businessId, metadata: { featureName, enabled } });
  return override;
}

export async function getBusinessOverrides(businessId: string) {
  return prisma.businessFeatureFlag.findMany({ where: { businessId } });
}
