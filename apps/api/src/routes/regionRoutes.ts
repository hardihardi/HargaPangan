import { Router, type IRouter } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createProvince,
  createProvinceSchema,
  createRegency,
  createRegencySchema,
  deleteProvince,
  deleteRegency,
  listProvinces,
  listRegencies,
  updateProvince,
  updateProvinceSchema,
  updateRegency,
  updateRegencySchema,
} from "../services/regionService";

const router: IRouter = Router();

// Provinsi (read-only endpoint dapat diakses publik)
router.get("/provinces", async (_req, res, next) => {
  try {
    const provinces = await listProvinces();
    res.json(provinces);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/provinces",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ body: createProvinceSchema }),
  async (req, res, next) => {
    try {
      const province = await createProvince(req.body);
      res.status(201).json(province);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/provinces/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: updateProvinceSchema,
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const province = await updateProvince(id, req.body);
      res.json(province);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/provinces/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await deleteProvince(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

// Kabupaten / Kota
router.get(
  "/regencies",
  validateRequest({
    query: z.object({
      provinceId: z.coerce.number().int().positive().optional(),
      search: z.string().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const { provinceId, search } = req.query as {
        provinceId?: number;
        search?: string;
      };
      const regencies = await listRegencies(provinceId, search);
      res.json(regencies);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/regencies",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ body: createRegencySchema }),
  async (req, res, next) => {
    try {
      const regency = await createRegency(req.body);
      res.status(201).json(regency);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/regencies/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: updateRegencySchema,
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const regency = await updateRegency(id, req.body);
      res.json(regency);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/regencies/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
  }),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      await deleteRegency(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;