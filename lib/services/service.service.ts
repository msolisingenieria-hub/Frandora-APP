import { prisma } from "@/lib/db/client";

export type ServiceListItem = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  isOnline: boolean;
  categoryName: string | null;
};

export type CreateServiceInput = {
  businessId: string;
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  isOnline?: boolean;
  categoryId?: string | null;
};

export type UpdateServiceInput = Partial<Omit<CreateServiceInput, "businessId">>;

export async function getServices(businessId: string): Promise<ServiceListItem[]> {
  const rows = await prisma.service.findMany({
    where: { businessId, isActive: true },
    include: { category: { select: { name: true } } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    duration: s.duration,
    price: Number(s.price),
    isOnline: s.isOnline,
    categoryName: s.category?.name ?? null,
  }));
}

export async function getServiceCategories(businessId: string) {
  return prisma.serviceCategory.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createService(input: CreateServiceInput) {
  return prisma.service.create({
    data: {
      businessId: input.businessId,
      name: input.name,
      description: input.description ?? null,
      duration: input.duration,
      price: input.price,
      isOnline: input.isOnline ?? true,
      categoryId: input.categoryId ?? null,
      isActive: true,
    },
  });
}

export async function updateService(id: string, businessId: string, data: UpdateServiceInput) {
  return prisma.service.update({
    where: { id, businessId },
    data: {
      ...(data.name !== undefined       && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.duration !== undefined    && { duration: data.duration }),
      ...(data.price !== undefined       && { price: data.price }),
      ...(data.isOnline !== undefined    && { isOnline: data.isOnline }),
      ...(data.categoryId !== undefined  && { categoryId: data.categoryId }),
    },
  });
}

export async function deleteService(id: string, businessId: string) {
  return prisma.service.update({
    where: { id, businessId },
    data: { isActive: false },
  });
}
