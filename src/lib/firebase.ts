import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseCredentials() {
  // 1. Direct environment variables
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  // 2. Service account JSON file path from ENV or default local key file
  const pathsToCheck = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    resolve(process.cwd(), "dialogue-c8291-firebase-adminsdk-fbsvc-b4b9e086a5.json"),
  ].filter(Boolean) as string[];

  for (const filePath of pathsToCheck) {
    try {
      if (existsSync(filePath)) {
        const raw = readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.project_id && parsed.client_email && parsed.private_key) {
          return {
            projectId: parsed.project_id,
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key,
          };
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return null;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseCredentials() !== null;
}

export function getFirebaseApp(): App {
  if (cachedApp) return cachedApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = existingApps[0];
    return cachedApp;
  }

  const creds = getFirebaseCredentials();
  if (!creds) {
    throw new Error(
      "Firebase ist nicht konfiguriert. Bitte FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL und FIREBASE_PRIVATE_KEY in .env oder Service Account JSON hinterlegen.",
    );
  }

  cachedApp = initializeApp({
    credential: cert({
      projectId: creds.projectId,
      clientEmail: creds.clientEmail,
      privateKey: creds.privateKey,
    }),
  });

  return cachedApp;
}

export function getFirestoreDb(): Firestore {
  if (cachedDb) return cachedDb;
  const app = getFirebaseApp();
  cachedDb = getFirestore(app);
  return cachedDb;
}
