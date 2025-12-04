import { Router } from "express";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  commoditySchema,
  deleteCommodity,
  listCommodities,
  toggleCommodityActive,
  updateCommodity,
  updateCommoditySchema,
  createCommodity,
} from "../services/commodityService";

const router = Router();

// Listing komoditas bisa diakses publik (dashboard, filter, dsb)
router.get("/", async (_req, res, next) => {
  try {
    const commodities = await listCommodities();
    res.json(commodities);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authMiddleware,
  requireRole(Role.ADMIN),
  validateRequest({ body: commoditySchema }),
  async (req, res, next) => {
    try {
      const commodity = await createCommodity(req.body);
      res.status(201).json(commodity);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/:id",
  authMiddleware,
  requireRole(Role.ADMIN),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: updateCommoditySchema,
  }),
  async (req, res, next) => {
    try {
      const commodity = await updateCommodity(req.params.id, req.body);
      res.json(commodity);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/toggle",
  authMiddleware,
  requireRole(Role.ADMIN),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: z.object({ isActive: z.boolean() }),
  }),
  async (req, res, next) => {
    try {
      const commodity = await toggleCommodityActive(
        req.params.id,
        req.body.isActive,
      );
      res.json(commodity);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole(Role.ADMIN),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
  }),
  async (req, res, next) => {
    try {
      await deleteCommodity(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;