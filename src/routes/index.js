import { Router } from "express";

import {
  devAuthEnabled,
  firebaseConfigured,
  geminiConfigured,
} from "../config/env.js";
import { checkDatabaseConnection } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import aiRoutes from "./ai.routes.js";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";

const router = Router();

// Liveness/readiness probe with feature/config visibility.
router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    let database = "down";
    try {
      await checkDatabaseConnection();
      database = "up";
    } catch {
      database = "down";
    }

    res.status(database === "up" ? 200 : 503).json({
      status: database === "up" ? "ok" : "degraded",
      services: {
        database,
        firebase: firebaseConfigured ? "configured" : "not_configured",
        gemini: geminiConfigured ? "configured" : "not_configured",
        devAuth: devAuthEnabled,
      },
      timestamp: new Date().toISOString(),
    });
  }),
);

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/ai", aiRoutes);

export default router;
