import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import router from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(compression());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

// error handler terakhir
app.use(errorHandler);