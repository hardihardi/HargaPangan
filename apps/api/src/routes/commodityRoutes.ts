import { Router, type IRouter } from "express";
import { z } from "zod";
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

const router: IRouter = Router();

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
  requireRole("ADMIN"),
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
  requireRole("ADMIN"),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: updateCommoditySchema,
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const commodity = await updateCommodity(id, req.body);
      res.json(commodity);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/toggle",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: z.object({ isActive: z.boolean() }),
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const commodity = await toggleCommodityActive(id, req.body.isActive);
      res.json(commodity);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await deleteCommodity(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;