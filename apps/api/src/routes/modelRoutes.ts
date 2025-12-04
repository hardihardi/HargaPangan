import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  getLatestModelMetrics,
  listModelRuns,
  trainModel,
} from "../services/modelService";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/active",
  authMiddleware,
  async (_req, res, next) => {
    try {
      const metrics = await getLatestModelMetrics();
      res.json({ metrics });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/runs",
  authMiddleware,
  requireRole(Role.ADMIN, Role.ANALYST),
  async (_req, res, next) => {
    try {
      const runs = await listModelRuns();
      res.json(runs);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/train",
  authMiddleware,
  requireRole(Role.ADMIN, Role.ANALYST),
  validateRequest({
    body: z.object({
      modelName: z.string().min(1),
      modelType: z.enum(["random_forest", "xgboost", "ensemble"]),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const { modelName, modelType, dateFrom, dateTo } = req.body;
      const result = await trainModel({
        modelName,
        modelType,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;