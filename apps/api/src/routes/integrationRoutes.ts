import { Router, type IRouter } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  listGovernmentSyncLogs,
  syncGovernmentPrices,
} from "../services/govPriceService";

const router: IRouter = Router();

const syncQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

/**
 * Sinkronisasi data harga dari API pemerintah Indonesia.
 *
 * Endpoint ini diasumsikan dipanggil oleh Admin/Analyst setelah
 * GOV_API_BASE_URL dan GOV_API_KEY dikonfigurasi di environment.
 */
router.post(
  "/gov/prices/sync",
  authMiddleware,
  requireRole("ADMIN", "ANALYST"),
  validateRequest({ query: syncQuerySchema }),
  async (req, res, next) => {
    try {
      const { dateFrom, dateTo } = req.query as z.infer<typeof syncQuerySchema>;

      const result = await syncGovernmentPrices({
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      res.status(200).json({
        message: "Sinkronisasi data harga dari API pemerintah berhasil",
        result,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * Mengambil riwayat sinkronisasi terbaru dari API pemerintah.
 */
router.get(
  "/gov/sync-logs",
  authMiddleware,
  requireRole("ADMIN", "ANALYST"),
  async (_req, res, next) => {
    try {
      const logs = await listGovernmentSyncLogs(20);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  },
);

export default router;