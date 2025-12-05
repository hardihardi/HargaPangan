import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL harus diisi"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET minimal 16 karakter"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, "JWT_REFRESH_SECRET minimal 16 karakter"),
  ML_SERVICE_URL: z
    .string()
    .url()
    .default("http://localhost:5000"),
  CORS_ORIGIN: z.string().optional(),
  // Opsional: integrasi API harga pangan pemerintah
  GOV_API_BASE_URL: z
    .string()
    .url()
    .or(z.literal("").optional())
    .optional(),
  GOV_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);