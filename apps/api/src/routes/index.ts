import { Router } from "express";
import authRoutes from "./authRoutes";
import regionRoutes from "./regionRoutes";
import commodityRoutes from "./commodityRoutes";
import priceRoutes from "./priceRoutes";
import modelRoutes from "./modelRoutes";
import reportRoutes from "./reportRoutes";
import dashboardRoutes from "./dashboardRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/regions", regionRoutes);
router.use("/commodities", commodityRoutes);
router.use("/prices", priceRoutes);
router.use("/models", modelRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;