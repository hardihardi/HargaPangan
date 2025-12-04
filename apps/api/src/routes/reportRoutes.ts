import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  exportReportToExcel,
  exportReportToPdf,
} from "../services/reportService";
import type { Role } from "@prisma/client";

const router = Router();

const reportQuerySchema = z.object({
  commodityId: z.coerce.number().int().positive(),
  provinceId: z.coerce.number().int().positive().optional(),
  startDate: z.string(),
  endDate: z.string(),
  format: z.enum(["pdf", "xlsx"]).default("pdf"),
});

router.get(
  "/weekly",
  authMiddleware,
  requireRole(Role.ADMIN, Role.ANALYST),
  validateRequest({ query: reportQuerySchema }),
  async (req, res, next) => {
    try {
      const { commodityId, provinceId, startDate, endDate, format } =
        req.query as unknown as z.infer<typeof reportQuerySchema>;

      const filter = {
        commodityId,
        provinceId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };

      if (format === "pdf") {
        const buffer = await exportReportToPdf(filter);
        res
          .status(200)
          .contentType("application/pdf")
          .setHeader(
            "Content-Disposition",
            "attachment; filename=laporan-harga-mingguan.pdf",
          )
          .send(buffer);
      } else {
        const buffer = await exportReportToExcel(filter);
        res
          .status(200)
          .contentType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          )
          .setHeader(
            "Content-Disposition",
            "attachment; filename=laporan-harga-mingguan.xlsx",
          )
          .send(buffer);
      }
    } catch (err) {
      next(err);
    }
  },
);

// Untuk kesederhanaan, laporan bulanan saat ini memanggil implementasi yang sama
router.get(
  "/monthly",
  authMiddleware,
  requireRole(Role.ADMIN, Role.ANALYST),
  validateRequest({ query: reportQuerySchema }),
  async (req, res, next) => {
    try {
      const { commodityId, provinceId, startDate, endDate, format } =
        req.query as unknown as z.infer<typeof reportQuerySchema>;

      const filter = {
        commodityId,
        provinceId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };

      if (format === "pdf") {
        const buffer = await exportReportToPdf(filter);
        res
          .status(200)
          .contentType("application/pdf")
          .setHeader(
            "Content-Disposition",
            "attachment; filename=laporan-harga-bulanan.pdf",
          )
          .send(buffer);
      } else {
        const buffer = await exportReportToExcel(filter);
        res
          .status(200)
          .contentType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          )
          .setHeader(
            "Content-Disposition",
            "attachment; filename=laporan-harga-bulanan.xlsx",
          )
          .send(buffer);
      }
    } catch (err) {
      next(err);
    }
  },
);

export default router;