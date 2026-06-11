import admin from "firebase-admin";

import { env, firebaseConfigured } from "./env.js";

let firebaseApp = null;

function resolveCredential() {
  // Prefer the full service-account JSON when provided.
  if (env.firebase.serviceAccountJson) {
    let parsed;
    try {
      parsed = JSON.parse(env.firebase.serviceAccountJson);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
    }
    if (typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return admin.credential.cert(parsed);
  }

  return admin.credential.cert({
    projectId: env.firebase.projectId,
    clientEmail: env.firebase.clientEmail,
    privateKey: env.firebase.privateKey,
  });
}

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  if (!firebaseConfigured) return null;

  firebaseApp = admin.initializeApp({ credential: resolveCredential() });

  return firebaseApp;
}

export async function verifyIdToken(idToken) {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase Admin is not configured");
  }
  return admin.auth(app).verifyIdToken(idToken);
}
