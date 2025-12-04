import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getDashboardSummary } from "../services/dashboardService";

const router = Router();

router.get(
  "/summary",
  async (_req, res, next) => {
    try {
      const summary = await getDashboardSummary();
      res.json(summary);
    } catch (err) {
      next(err);
    }
  },
);

export default router;