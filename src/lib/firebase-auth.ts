import { getAuth, type UserRecord } from "firebase-admin/auth";
import { getFirebaseApp, isFirebaseConfigured } from "./firebase";
import { HttpError } from "./security";

export function firebaseAuthEnabled() {
  return process.env.FIREBASE_AUTH_ENABLED === "true";
}

export function firebaseAuthReady() {
  return Boolean(process.env.FIREBASE_WEB_API_KEY && isFirebaseConfigured());
}

function firebaseAuth() {
  if (!firebaseAuthReady())
    throw new HttpError(503, "Firebase-Anmeldung ist noch nicht eingerichtet. Bitte die Server-Konfiguration prüfen.");
  return getAuth(getFirebaseApp());
}

function authError(error: unknown): never {
  if (error instanceof HttpError) throw error;
  const code = (error as { code?: string })?.code;
  if (code === "auth/email-already-exists")
    throw new HttpError(409, "Dieses Konto existiert bereits. Bitte melde dich an.");
  if (code === "auth/invalid-password")
    throw new HttpError(400, "Das Passwort entspricht nicht den Firebase-Passwortregeln.");
  if (["auth/user-disabled", "auth/user-not-found", "auth/id-token-revoked", "auth/id-token-expired", "auth/invalid-id-token", "auth/argument-error"].includes(code || ""))
    throw new HttpError(401, "Anmeldung nicht möglich. Bitte melde dich erneut an.");
  throw new HttpError(503, "Firebase-Anmeldung ist vorübergehend nicht erreichbar. Bitte später erneut versuchen.");
}

export async function createFirebaseUser(email: string, password: string, name: string) {
  try {
    return await firebaseAuth().createUser({ email, password, displayName: name });
  } catch (error) { authError(error); }
}

export async function removeFirebaseUser(uid: string) {
  // Used only to compensate a failed registration in the local database.
  try { await firebaseAuth().deleteUser(uid); }
  catch (error) {
    if ((error as { code?: string })?.code !== "auth/user-not-found") authError(error);
  }
}

export async function signInFirebase(email: string, password: string): Promise<{ uid: string; authenticatedAt: Date }> {
  const auth = firebaseAuth();
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(process.env.FIREBASE_WEB_API_KEY!)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
        redirect: "error",
      },
    );
    const result = await response.json();
    if (!response.ok) {
      const code = result.error?.message;
      if (["INVALID_LOGIN_CREDENTIALS", "EMAIL_NOT_FOUND", "INVALID_PASSWORD", "USER_DISABLED"].includes(code))
        throw new HttpError(401, "E-Mail oder Passwort ist nicht korrekt.");
      if (code === "TOO_MANY_ATTEMPTS_TRY_LATER" || response.status === 429)
        throw new HttpError(429, "Zu viele Anmeldeversuche. Bitte später erneut versuchen.");
      throw new HttpError(503, "Firebase-Anmeldung nicht verfügbar. Bitte E-Mail/Passwort-Anmeldung und API-Key in Firebase prüfen.");
    }
    if (typeof result.idToken !== "string") throw new HttpError(503, "Firebase hat keine gültige Anmeldung zurückgegeben.");
    // Verify audience/project and revocation using our configured Admin app.
    // Neither the ID token nor the refresh token is sent to the browser or stored.
    const identity = await auth.verifyIdToken(result.idToken, true);
    if (identity.email?.toLowerCase() !== email.toLowerCase() || identity.firebase.sign_in_provider !== "password")
      throw new HttpError(401, "E-Mail oder Passwort ist nicht korrekt.");
    if (!Number.isFinite(identity.auth_time)) throw new HttpError(401, "Ungültiger Anmeldezeitpunkt.");
    return { uid: identity.uid, authenticatedAt: new Date(identity.auth_time * 1000) };
  } catch (error) { authError(error); }
}

export async function checkFirebaseSession(uid: string, createdAt: Date) {
  let user: UserRecord;
  try { user = await firebaseAuth().getUser(uid); }
  catch (error) { authError(error); }
  if (user.disabled || (user.tokensValidAfterTime && Date.parse(user.tokensValidAfterTime) > createdAt.getTime()))
    throw new HttpError(401, "Deine Sitzung wurde beendet. Bitte melde dich erneut an.");
}
