import dotenv from "dotenv";

dotenv.config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// Tracks whether a FIREBASE_SERVICE_ACCOUNT was supplied but failed to parse,
// so we can warn instead of silently breaking auth.
export let firebaseServiceAccountInvalid = false;

function parseServiceAccount(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.private_key && parsed.client_email) {
      if (typeof parsed.private_key === "string") {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return parsed;
    }
    firebaseServiceAccountInvalid = true;
    return null;
  } catch {
    firebaseServiceAccountInvalid = true;
    return null;
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toInt(process.env.PORT, 5000),

  // Database
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://schedulnyx:schedulnyx_dev@localhost:5432/schedulnyx",

  // Firebase Admin (service account).
  // Either provide the full service-account JSON via FIREBASE_SERVICE_ACCOUNT,
  // or the three individual fields below.
  firebase: {
    serviceAccount: parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT),
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    // Support newline-escaped private keys from .env files.
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },

  // Gemini
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

export const isProduction = env.nodeEnv === "production";
export const isTest = env.nodeEnv === "test";

/**
 * When true, the auth middleware accepts an `x-dev-uid` header instead of a real
 * Firebase token. This lets the API be exercised locally before Firebase
 * credentials are wired up. It is force-disabled in production.
 */
export const devAuthEnabled =
  !isProduction && process.env.DEV_AUTH !== "false";

export const firebaseConfigured =
  Boolean(env.firebase.serviceAccountJson) ||
  Boolean(
    env.firebase.projectId &&
      env.firebase.clientEmail &&
      env.firebase.privateKey,
  );

export const geminiConfigured = Boolean(env.geminiApiKey);
