import admin from "firebase-admin";

import { env, firebaseConfigured } from "./env.js";

let firebaseApp = null;

function resolveCredential() {
  // Prefer the full service-account JSON when provided (already parsed/validated).
  if (env.firebase.serviceAccount) {
    return admin.credential.cert(env.firebase.serviceAccount);
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
