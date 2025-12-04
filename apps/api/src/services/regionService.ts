import { z } from "zod";
import { prisma } from "../config/prisma";

export const createProvinceSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
});

export const updateProvinceSchema = createProvinceSchema.partial();

export const createRegencySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  provinceId: z.number().int().positive(),
});

export const updateRegencySchema = createRegencySchema.partial();

export async function listProvinces() {
  return prisma.province.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createProvince(input: z.infer<typeof createProvinceSchema>) {
  return prisma.province.create({ data: input });
}

export async function updateProvince(
  id: number,
  input: z.infer<typeof updateProvinceSchema>,
) {
  return prisma.province.update({
    where: { id },
    data: input,
  });
}

export async function deleteProvince(id: number) {
  await prisma.province.delete({ where: { id } });
}

export async function listRegencies(provinceId?: number, search?: string) {
  return prisma.regency.findMany({
    where: {
      provinceId,
      name: search
        ? {
            contains: search,
            mode: "insensitive",
          }
        : undefined,
    },
    orderBy: [{ province: { name: "asc" } }, { name: "asc" }],
    include: {
      province: true,
    },
  });
}

export async function createRegency(input: z.infer<typeof createRegencySchema>) {
  return prisma.regency.create({ data: input });
}

export async function updateRegency(
  id: number,
  input: z.infer<typeof updateRegencySchema>,
) {
  return prisma.regency.update({
    where: { id },
    data: input,
  });
}

export async function deleteRegency(id: number) {
  await prisma.regency.delete({ where: { id } });
}