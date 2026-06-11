import { createApp } from "./app.js";
import { pool } from "./config/db.js";
import {
  env,
  firebaseConfigured,
  firebaseServiceAccountInvalid,
  geminiConfigured,
} from "./config/env.js";
import { runMigrations } from "./db/migrate.js";

async function start() {
  // Best-effort migrations on boot so local/dev environments are always ready.
  try {
    await runMigrations();
  } catch (err) {
    console.error(
      "Database migrations failed. Is PostgreSQL running and DATABASE_URL correct?",
    );
    console.error(err.message);
  }

  if (firebaseServiceAccountInvalid) {
    console.warn(
      "FIREBASE_SERVICE_ACCOUNT was provided but is not valid service-account JSON — ignoring it.",
    );
  }
  if (!firebaseConfigured) {
    console.warn(
      "Firebase Admin not configured — dev auth (x-dev-uid header) is active.",
    );
  }
  if (!geminiConfigured) {
    console.warn("GEMINI_API_KEY not set — /api/ai/generate will return 503.");
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`Schedulnyx backend running on port ${env.port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start();
