import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { db } from "./db";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function sessionHash(value: string) {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)
    throw new HttpError(503, "AUTH_SECRET fehlt oder ist zu kurz.");
  return createHmac("sha256", process.env.AUTH_SECRET)
    .update(value)
    .digest("hex");
}
export function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, encoded: string) {
  const [salt, digest] = encoded.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function encryptionKey() {
  const key = process.env.ENCRYPTION_KEY || "";
  if (!/^[a-fA-F0-9]{64}$/.test(key))
    throw new HttpError(
      503,
      "ENCRYPTION_KEY muss 32 Byte als Hex-Wert enthalten.",
    );
  return Buffer.from(key, "hex");
}
export function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data]
    .map((x) => x.toString("base64"))
    .join(".");
}
export function decrypt(value: string) {
  const [iv, tag, data] = value.split(".").map((x) => Buffer.from(x, "base64"));
  const cipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data), cipher.final()]).toString("utf8");
}
export function csrf(request: Request) {
  const expected = new URL(process.env.APP_URL || "http://localhost:3000")
    .origin;
  if (request.headers.get("origin") !== expected)
    throw new HttpError(403, "Ungültiger Anfrage-Ursprung.");
}
export function clientKey(request: Request) {
  // Never trust user-supplied forwarding headers unless the deployment opts in.
  const ip =
    process.env.TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0].trim()
      : "shared";
  return sessionHash(ip || "shared");
}
export async function rateLimit(key: string, limit: number, seconds: number) {
  const expiresAt = new Date(Date.now() + seconds * 1000);
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."expiresAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" < NOW() THEN ${expiresAt} ELSE "RateLimit"."expiresAt" END
    RETURNING "count"`;
  if (rows[0].count > limit)
    throw new HttpError(
      429,
      "Zu viele Anfragen. Bitte später erneut versuchen.",
    );
}
export async function readBody(request: Request, maxBytes = 64 * 1024) {
  if (!request.body) throw new HttpError(400, "Anfrage ist leer.");
  const reader = request.body.getReader();
  let size = 0;
  const parts: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "Datei oder Anfrage ist zu groß.");
    }
    parts.push(value);
  }
  return Buffer.concat(parts);
}
export async function jsonBody(
  request: Request,
  maxBytes?: number,
): Promise<unknown> {
  try {
    return JSON.parse((await readBody(request, maxBytes)).toString("utf8"));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Ungültiges JSON.");
  }
}
export function domainAllowed(origin: string | null, domains: string[]) {
  if (!origin || origin === "null") return false;
  try {
    const url = new URL(origin);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      domains.includes(url.host.toLowerCase())
    );
  } catch {
    return false;
  }
}
