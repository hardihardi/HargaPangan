import axios from "axios";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export interface GovSyncOptions {
  dateFrom?: Date;
  dateTo?: Date;
}

export interface GovSyncResult {
  from: string;
  to: string;
  totalFetched: number;
  inserted: number;
  updated: number;
  skipped: number;
}

/**
 * Sinkronisasi data harga dari API pemerintah Indonesia ke tabel DailyPrice.
 *
 * Catatan penting:
 * - Struktur field JSON dari API pemerintah bisa berbeda-beda.
 * - Implementasi default ini mengasumsikan adanya field umum:
 *   - kode_provinsi / province_code
 *   - kode_kabupaten / regency_code
 *   - id_komoditas / commodity_id
 *   - tanggal / date (YYYY-MM-DD)
 *   - harga / price
 *
 * Anda perlu menyesuaikan bagian pemetaan (mapping) sesuai spesifikasi API resmi
 * yang Anda gunakan.
 */
export async function syncGovernmentPrices(
  options: GovSyncOptions,
): Promise<GovSyncResult> {
  if (!env.GOV_API_BASE_URL || !env.GOV_API_KEY) {
    throw new Error(
      "GOV_API_BASE_URL atau GOV_API_KEY belum dikonfigurasi di environment",
    );
  }

  const now = options.dateTo ?? new Date();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const fromDate = options.dateFrom ?? new Date(now.getTime() - sevenDaysMs);
  const toDate = options.dateTo ?? now;

  const fromStr = fromDate.toISOString().slice(0, 10);
  const toStr = toDate.toISOString().slice(0, 10);

  const url = new URL("/prices", env.GOV_API_BASE_URL);
  url.searchParams.set("start_date", fromStr);
  url.searchParams.set("end_date", toStr);

  let rows: unknown;
  try {
    const res = await axios.get(url.toString(), {
      headers: {
        // Banyak API pemerintah menggunakan header x-api-key, namun ini bisa Anda ganti
        // sesuai kebutuhan spesifik API yang Anda miliki.
        "x-api-key": env.GOV_API_KEY,
      },
      timeout: 30_000,
    });
    rows = res.data;
  } catch (err) {
    logger.error("Gagal memanggil API pemerintah", err);
    await prisma.syncLog.create({
      data: {
        externalApiId: null,
        status: "FAILED",
        runAt: new Date(),
        records: 0,
        errorMessage: "Gagal memanggil API pemerintah",
        details: {
          from: fromStr,
          to: toStr,
          error: err instanceof Error ? err.message : String(err),
        },
      },
    });
    throw err;
  }

  if (!Array.isArray(rows)) {
    throw new Error("Respons API pemerintah tidak berupa array JSON");
  }

  const provinces = await prisma.province.findMany();
  const regencies = await prisma.regency.findMany();
  const commodities = await prisma.commodity.findMany();

  const provinceByCode = new Map<string, number>();
  for (const p of provinces) {
    provinceByCode.set(String(p.code), p.id);
  }

  const regencyByProvinceAndCode = new Map<string, number>();
  for (const r of regencies) {
    regencyByProvinceAndCode.set(`${r.provinceId}:${String(r.code)}`, r.id);
  }

  const commodityById = new Map<number, number>();
  for (const c of commodities) {
    commodityById.set(c.id, c.id);
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const r: any = row;

    const provinceCode =
      r.kode_provinsi ?? r.province_code ?? r.provinceCode ?? null;
    const regencyCode =
      r.kode_kabupaten ?? r.regency_code ?? r.regencyCode ?? null;
    const commodityExternalId =
      r.id_komoditas ?? r.commodity_id ?? r.commodityId ?? null;
    const dateRaw = r.tanggal ?? r.date ?? null;
    const priceRaw = r.harga ?? r.price ?? null;

    if (
      provinceCode == null ||
      regencyCode == null ||
      commodityExternalId == null ||
      dateRaw == null ||
      priceRaw == null
    ) {
      skipped += 1;
      continue;
    }

    const provinceId = provinceByCode.get(String(provinceCode));
    if (!provinceId) {
      skipped += 1;
      continue;
    }

    const regencyId = regencyByProvinceAndCode.get(
      `${provinceId}:${String(regencyCode)}`,
    );
    if (!regencyId) {
      skipped += 1;
      continue;
    }

    const commodityId = commodityById.get(Number(commodityExternalId));
    if (!commodityId) {
      skipped += 1;
      continue;
    }

    const date = new Date(String(dateRaw));
    if (Number.isNaN(date.getTime())) {
      skipped += 1;
      continue;
    }

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price <= 0) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.dailyPrice.findUnique({
      where: {
        provinceId_regencyId_commodityId_date: {
          provinceId,
          regencyId,
          commodityId,
          date,
        },
      },
    });

    if (existing) {
      await prisma.dailyPrice.update({
        where: { id: existing.id },
        data: {
          price,
          source: "GOV_API",
        },
      });
      updated += 1;
    } else {
      await prisma.dailyPrice.create({
        data: {
          provinceId,
          regencyId,
          commodityId,
          date,
          price,
          source: "GOV_API",
        },
      });
      inserted += 1;
    }
  }

  await prisma.syncLog.create({
    data: {
      externalApiId: null,
      status: "SUCCESS",
      runAt: new Date(),
      records: inserted + updated,
      errorMessage: null,
      details: {
        from: fromStr,
        to: toStr,
        inserted,
        updated,
        skipped,
      },
    },
  });

  logger.info(
    `Sinkronisasi API pemerintah selesai: fetched=${rows.length}, inserted=${inserted}, updated=${updated}, skipped=${skipped}`,
  );

  return {
    from: fromStr,
    to: toStr,
    totalFetched: rows.length,
    inserted,
    updated,
    skipped,
  };
}