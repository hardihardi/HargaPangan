import { z } from "zod";
import { prisma } from "../config/prisma";

export const commoditySchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const updateCommoditySchema = commoditySchema.partial();

export async function listCommodities() {
  return prisma.commodity.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCommodity(input: z.infer<typeof commoditySchema>) {
  return prisma.commodity.create({
    data: {
      ...input,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateCommodity(
  id: number,
  input: z.infer<typeof updateCommoditySchema>,
) {
  return prisma.commodity.update({
    where: { id },
    data: input,
  });
}

export async function toggleCommodityActive(id: number, isActive: boolean) {
  return prisma.commodity.update({
    where: { id },
    data: { isActive },
  });
}

export async function deleteCommodity(id: number) {
  await prisma.commodity.delete({ where: { id } });
}