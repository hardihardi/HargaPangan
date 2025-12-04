import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import {
  createUser,
  createUserSchema,
  listUsers,
  login,
  loginSchema,
  refreshSession,
  resetPassword,
  updateUser,
  updateUserSchema,
} from "../services/userService";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { z } from "zod";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const result = await login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/refresh",
  validateRequest({
    body: z.object({
      refreshToken: z.string().min(1),
    }),
  }),
  async (req, res, next) => {
    try {
      const result = await refreshSession(req.body.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

// --- Admin user management ---

router.get(
  "/users",
  authMiddleware,
  requireRole(Role.ADMIN),
  async (_req, res, next) => {
    try {
      const users = await listUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/users",
  authMiddleware,
  requireRole(Role.ADMIN),
  validateRequest({ body: createUserSchema }),
  async (req, res, next) => {
    try {
      const user = await createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/users/:id",
  authMiddleware,
  requireRole(Role.ADMIN),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: updateUserSchema,
  }),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await updateUser(id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/users/:id/reset-password",
  authMiddleware,
  requireRole(Role.ADMIN),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: z.object({ newPassword: z.string().min(6) }),
  }),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      await resetPassword(id, req.body.newPassword);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/users/:id/activate",
  authMiddleware,
  requireRole(Role.ADMIN),
  validateRequest({
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: z.object({ isActive: z.boolean() }),
  }),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      await updateUser(id, { isActive: req.body.isActive });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;