import { z } from "zod";
import { prisma } from "../config/prisma";
import {
  mlPredict,
  type MlHistoryPoint,
  type MlPredictRequest,
} from "./mlService";

export const manualPriceInputSchema = z.object({
  provinceId: z.number().int().positive(),
  regencyId: z.number().int().positive(),
  commodityId: z.number().int().positive(),
  date: z.coerce.date(),
  price: z.coerce.number().positive(),
  source: z.string().min(1),
});

export const priceQuerySchema = z.object({
  provinceId: z.coerce.number().int().positive().optional(),
  regencyId: z.coerce.number().int().positive().optional(),
  commodityId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listDailyPrices(
  query: z.infer<typeof priceQuerySchema>,
) {
  const { provinceId, regencyId, commodityId, dateFrom, dateTo, skip, take } =
    query;

  const where = {
    provinceId,
    regencyId,
    commodityId,
    date: {
      gte: dateFrom,
      lte: dateTo,
    },
  };

  const [items, total] = await Promise.all([
    prisma.dailyPrice.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take,
      include: {
        province: true,
        regency: true,
        commodity: true,
      },
    }),
    prisma.dailyPrice.count({ where }),
  ]);

  return { items, total };
}

export async function createManualPrice(
  input: z.infer<typeof manualPriceInputSchema>,
) {
  // Cegah duplikasi untuk kombinasi (tanggal, wilayah, komoditas)
  const exists = await prisma.dailyPrice.findUnique({
    where: {
      provinceId_regencyId_commodityId_date: {
        provinceId: input.provinceId,
        regencyId: input.regencyId,
        commodityId: input.commodityId,
        date: input.date,
      },
    },
  });

  if (exists) {
    throw new Error(
      "Data harga untuk kombinasi tanggal, wilayah, dan komoditas tersebut sudah ada.",
    );
  }

  const created = await prisma.dailyPrice.create({
    data: input,
  });

  return created;
}

export const predictionRequestSchema = z.object({
  provinceId: z.number().int().positive(),
  regencyId: z.number().int().positive(),
  commodityId: z.number().int().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export async function generatePredictions(
  input: z.infer<typeof predictionRequestSchema>,
) {
  const { provinceId, regencyId, commodityId, startDate, endDate } = input;

  if (startDate > endDate) {
    throw new Error("startDate harus lebih kecil atau sama dengan endDate");
  }

  const historyRows = await prisma.dailyPrice.findMany({
    where: {
      provinceId,
      regencyId,
      commodityId,
    },
    orderBy: { date: "asc" },
  });

  const history: MlHistoryPoint[] = historyRows.map((row) => ({
    date: row.date.toISOString(),
    price: Number(row.price),
  }));

  const payload: MlPredictRequest = {
    province_id: provinceId,
    regency_id: regencyId,
    commodity_id: commodityId,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    history,
  };

  const predictions = await mlPredict(payload);

  // simpan ke tabel prediksi_harga
  const created = await prisma.$transaction(
    predictions.map((p) =>
      prisma.pricePrediction.upsert({
        where: {
          provinceId_regencyId_commodityId_predictionDate: {
            provinceId,
            regencyId,
            commodityId,
            predictionDate: new Date(p.date),
          },
        },
        create: {
          provinceId,
          regencyId,
          commodityId,
          predictionDate: new Date(p.date),
          predictedPrice: p.predicted_price,
          modelName: p.model_name,
        },
        update: {
          predictedPrice: p.predicted_price,
          modelName: p.model_name,
        },
      }),
    ),
  );

  return created;
}