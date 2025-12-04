import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createManualPrice,
  listDailyPrices,
  manualPriceInputSchema,
  predictionRequestSchema,
  generatePredictions,
} from "../services/priceService";

const router = Router();

// SSE clients
type SseClient = {
  id: number;
  res: import("express").Response;
};

const clients: SseClient[] = [];
let clientIdCounter = 1;

function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.res.write(payload);
  }
}

router.get(
  "/daily",
  validateRequest({
    query: z.object({
      provinceId: z.coerce.number().int().positive().optional(),
      regencyId: z.coerce.number().int().positive().optional(),
      commodityId: z.coerce.number().int().positive().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      skip: z.coerce.number().int().min(0).default(0),
      take: z.coerce.number().int().min(1).max(100).default(20),
    }),
  }),
  async (req, res, next) => {
    try {
      const query = {
        ...req.query,
        dateFrom: req.query.dateFrom
          ? new Date(String(req.query.dateFrom))
          : undefined,
        dateTo: req.query.dateTo
          ? new Date(String(req.query.dateTo))
          : undefined,
      };
      const result = await listDailyPrices(query as any);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/daily",
  authMiddleware,
  validateRequest({ body: manualPriceInputSchema }),
  async (req, res, next) => {
    try {
      const created = await createManualPrice(req.body);
      broadcast("price_created", created);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/stream", (req, res) => {
  const clientId = clientIdCounter++;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const client: SseClient = { id: clientId, res };
  clients.push(client);

  res.write(`event: connected\ndata: ${JSON.stringify({ id: clientId })}\n\n`);

  req.on("close", () => {
    const index = clients.findIndex((c) => c.id === clientId);
    if (index !== -1) clients.splice(index, 1);
  });
});

router.post(
  "/predictions/generate",
  authMiddleware,
  validateRequest({ body: predictionRequestSchema }),
  async (req, res, next) => {
    try {
      const created = await generatePredictions(req.body);
      broadcast("prediction_generated", created);
      res.json(created);
    } catch (err) {
      next(err);
    }
  },
);

export default router;