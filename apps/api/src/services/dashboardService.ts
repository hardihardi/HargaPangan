import { prisma } from "../config/prisma";
import { mlGetMetrics } from "./mlService";

export async function getDashboardSummary() {
  const [commodityCount, provinceCount, regencyCount, priceCount] =
    await Promise.all([
      prisma.commodity.count({ where: { isActive: true } }),
      prisma.province.count(),
      prisma.regency.count(),
      prisma.dailyPrice.count(),
    ]);

  const latestDateRow = await prisma.dailyPrice.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  const latestDate = latestDateRow?.date ?? new Date();

  const oneWeekAgo = new Date(latestDate);
  oneWeekAgo.setDate(latestDate.getDate() - 7);

  const [latestPrices, lastWeekPrices] = await Promise.all([
    prisma.dailyPrice.groupBy({
      by: ["commodityId"],
      where: { date: latestDate },
      _avg: { price: true },
    }),
    prisma.dailyPrice.groupBy({
      by: ["commodityId"],
      where: { date: oneWeekAgo },
      _avg: { price: true },
    }),
  ]);

  const priceChange: {
    commodityId: number;
    current: number;
    lastWeek: number | null;
    changePct: number | null;
  }[] = latestPrices.map((row) => {
    const lastWeek = lastWeekPrices.find(
      (r) => r.commodityId === row.commodityId,
    );
    const current = Number(row._avg.price ?? 0);
    const previous = lastWeek ? Number(lastWeek._avg.price ?? 0) : null;

    let changePct: number | null = null;
    if (previous && previous !== 0) {
      changePct = ((current - previous) / previous) * 100;
    }

    return {
      commodityId: row.commodityId,
      current,
      lastWeek: previous,
      changePct,
    };
  });

  const modelMetrics = await mlGetMetrics();

  const alerts = await prisma.$queryRaw<
    {
      provinceId: number;
      regencyId: number;
      commodityId: number;
      latestPrice: number;
      prevPrice: number | null;
      changePct: number | null;
    }[]
  >`
    WITH latest AS (
      SELECT
        "provinceId",
        "regencyId",
        "commodityId",
        MAX(date) AS latest_date
      FROM "DailyPrice"
      GROUP BY "provinceId", "regencyId", "commodityId"
    ),
    joined AS (
      SELECT
        d."provinceId",
        d."regencyId",
        d."commodityId",
        d.date,
        d.price,
        LAG(d.price) OVER (
          PARTITION BY d."provinceId", d."regencyId", d."commodityId"
          ORDER BY d.date
        ) AS prev_price
      FROM "DailyPrice" d
      JOIN latest l
        ON d."provinceId" = l."provinceId"
       AND d."regencyId" = l."regencyId"
       AND d."commodityId" = l."commodityId"
       AND d.date >= l.latest_date - INTERVAL '7 days'
    )
    SELECT
      "provinceId" AS "provinceId",
      "regencyId" AS "regencyId",
      "commodityId" AS "commodityId",
      price       AS "latestPrice",
      prev_price  AS "prevPrice",
      CASE
        WHEN prev_price IS NULL OR prev_price = 0 THEN NULL
        ELSE ((price - prev_price) / prev_price) * 100
      END AS "changePct"
    FROM joined
    WHERE date = (
      SELECT MAX(date)
      FROM "DailyPrice" d2
      WHERE d2."provinceId" = joined."provinceId"
        AND d2."regencyId" = joined."regencyId"
        AND d2."commodityId" = joined."commodityId"
    )
  `;

  return {
    totals: {
      commodityCount,
      provinceCount,
      regencyCount,
      priceCount,
    },
    latestDate,
    priceChange,
    modelMetrics,
    alerts,
  };
}