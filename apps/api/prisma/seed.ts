import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with initial data...");

  // --- Wilayah: Provinsi dan Kabupaten/Kota ---
  const jakarta = await prisma.province.upsert({
    where: { code: "31" },
    update: {},
    create: {
      code: "31",
      name: "DKI Jakarta",
    },
  });

  const jawaBarat = await prisma.province.upsert({
    where: { code: "32" },
    update: {},
    create: {
      code: "32",
      name: "Jawa Barat",
    },
  });

  const jakpus = await prisma.regency.upsert({
    where: { provinceId_code: { provinceId: jakarta.id, code: "3171" } },
    update: {},
    create: {
      code: "3171",
      name: "Kota Jakarta Pusat",
      provinceId: jakarta.id,
    },
  });

  const bandung = await prisma.regency.upsert({
    where: { provinceId_code: { provinceId: jawaBarat.id, code: "3273" } },
    update: {},
    create: {
      code: "3273",
      name: "Kota Bandung",
      provinceId: jawaBarat.id,
    },
  });

  const bekasi = await prisma.regency.upsert({
    where: { provinceId_code: { provinceId: jawaBarat.id, code: "3216" } },
    update: {},
    create: {
      code: "3216",
      name: "Kabupaten Bekasi",
      provinceId: jawaBarat.id,
    },
  });

  // --- Komoditas ---
  const beras = await prisma.commodity.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Beras Medium",
      category: "Pangan Pokok",
      unit: "kg",
    },
  });

  const cabai = await prisma.commodity.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Cabai Merah",
      category: "Bumbu",
      unit: "kg",
    },
  });

  const bawang = await prisma.commodity.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "Bawang Merah",
      category: "Bumbu",
      unit: "kg",
    },
  });

  const today = new Date();
  const regions = [
    { province: jakarta, regency: jakpus },
    { province: jawaBarat, regency: bandung },
    { province: jawaBarat, regency: bekasi },
  ];
  const commodities = [beras, cabai, bawang];

  // hapus harga sebelumnya agar seed idempotent
  await prisma.dailyPrice.deleteMany();

  const prices: {
    provinceId: number;
    regencyId: number;
    commodityId: number;
    date: Date;
    price: number;
    source: string;
  }[] = [];

  for (let dayOffset = 60; dayOffset >= 0; dayOffset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);

    for (const { province, regency } of regions) {
      for (const commodity of commodities) {
        const base =
          commodity.id === beras.id
            ? 12000
            : commodity.id === cabai.id
              ? 60000
              : 30000;

        const noise = (Math.random() - 0.5) * 3000;
        const trend = (60 - dayOffset) * 20; // tren sederhana naik
        const price = Math.max(1000, base + noise + trend);

        prices.push({
          provinceId: province.id,
          regencyId: regency.id,
          commodityId: commodity.id,
          date,
          price: Math.round(price),
          source: "SEED_DUMMY",
        });
      }
    }
  }

  await prisma.dailyPrice.createMany({ data: prices });
  console.log(`Inserted ${prices.length} daily price rows`);

  // --- System setting default ---
  await prisma.systemSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      priceSpikeThreshold: 15,
      timezone: "Asia/Jakarta",
      language: "id",
    },
  });

  // --- Users ---
  const password = "Pangan123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: "admin@pangan.local" },
    update: {},
    create: {
      name: "Admin Utama",
      email: "admin@pangan.local",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "analis@pangan.local" },
    update: {},
    create: {
      name: "Analis Harga",
      email: "analis@pangan.local",
      passwordHash,
      role: "ANALYST",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@pangan.local" },
    update: {},
    create: {
      name: "Viewer Dashboard",
      email: "viewer@pangan.local",
      passwordHash,
      role: "VIEWER",
      isActive: true,
    },
  });

  console.log("Seed selesai. Login default:");
  console.log("- admin@pangan.local / Pangan123!");
  console.log("- analis@pangan.local / Pangan123!");
  console.log("- viewer@pangan.local / Pangan123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });