import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Mark _next as used to satisfy linting while tetap mempertahankan
  // signature middleware error Express (4 argumen).
  void _next;

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validasi gagal",
      errors: err.errors,
    });
  }

  if (err instanceof Error) {
    logger.error("Unhandled error", err);
    return res.status(500).json({
      message: err.message,
    });
  }

  logger.error("Unknown error", err);
  return res.status(500).json({
    message: "Terjadi kesalahan pada server",
  });
}