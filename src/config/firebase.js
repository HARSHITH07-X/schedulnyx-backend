import admin from "firebase-admin";

import { env, firebaseConfigured } from "./env.js";

let firebaseApp = null;

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  if (!firebaseConfigured) return null;

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
  });

  return firebaseApp;
}

export async function verifyIdToken(idToken) {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase Admin is not configured");
  }
  return admin.auth(app).verifyIdToken(idToken);
}
