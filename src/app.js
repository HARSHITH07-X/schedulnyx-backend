import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import apiRoutes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(","),
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-dev-uid",
        "x-dev-email",
        "x-dev-name",
      ],
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  // Root welcome (kept from the original prototype).
  app.get("/", (_req, res) => {
    res.json({ message: "Schedulnyx Backend Live 🚀" });
  });

  app.use("/api", apiLimiter, apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
