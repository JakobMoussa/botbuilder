import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
const firebase = vi.hoisted(() => ({ createFirebaseUser: vi.fn(), removeFirebaseUser: vi.fn(), signInFirebase: vi.fn(), checkFirebaseSession: vi.fn() }));
vi.mock("../src/lib/firebase-auth", () => ({
  ...firebase, firebaseAuthEnabled: () => true, firebaseAuthReady: () => true,
}));
import { db } from "../src/lib/db";
import { handleApi } from "../src/lib/api";
import { HttpError, passwordHash } from "../src/lib/security";
const prefix = `firebase-test-${randomUUID()}`;
let userId: string, cookie = "";
const email = `${prefix}@example.test`, password = "integration-long-password";
async function call(path: string, body?: unknown, session = "", origin = "http://localhost:3000") {
  return handleApi(new Request(`http://localhost:3000/api/${path}`, {
    method: body ? "POST" : "GET",
    headers: { origin, cookie: session, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }), path.split("/"));
}
beforeAll(() => {
  vi.stubEnv("APP_URL", "http://localhost:3000");
  vi.stubEnv("AUTH_SECRET", randomUUID() + randomUUID());
  vi.stubEnv("ALLOW_REGISTRATION", "true");
});
beforeEach(() => {
  vi.resetAllMocks();
  firebase.createFirebaseUser.mockResolvedValue({ uid: prefix, metadata: { creationTime: new Date().toISOString() } });
  firebase.signInFirebase.mockResolvedValue({ uid: prefix, authenticatedAt: new Date() });
  firebase.checkFirebaseSession.mockResolvedValue(undefined);
});
afterAll(async () => {
  const users = await db.user.findMany({ where: { email: { startsWith: prefix } }, include: { memberships: true } });
  await db.workspace.deleteMany({ where: { id: { in: users.flatMap(u => u.memberships.map(m => m.workspaceId)) } } });
  await db.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
  await db.$disconnect();
  vi.unstubAllEnvs();
});
describe.sequential("Firebase accounts with real PostgreSQL and mocked Firebase", () => {
  it("creates a workspace and UID mapping without a local password", async () => {
    const response = await call("auth/register", { email, password, name: "Firebase Test", workspace: "Firebase Test" });
    expect(response.status).toBe(201);
    cookie = response.headers.get("set-cookie")!.split(";")[0];
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    expect(user.firebaseUid).toBe(prefix);
    expect(user.passwordHash).toBeNull();
    const me = await call("auth/me", undefined, cookie);
    expect(me.status).toBe(200);
    expect((await me.json()).user.authProvider).toBe("firebase");
    expect(firebase.checkFirebaseSession).toHaveBeenCalled();
  });
  it("logs in only when the verified UID matches and revokes the local session on logout", async () => {
    firebase.signInFirebase.mockResolvedValueOnce({ uid: "another-uid", authenticatedAt: new Date() });
    expect((await call("auth/login", { email, password })).status).toBe(401);
    const response = await call("auth/login", { email, password });
    expect(response.status).toBe(200);
    const loginCookie = response.headers.get("set-cookie")!.split(";")[0];
    expect((await call("auth/logout", {}, loginCookie)).status).toBe(200);
    expect((await call("auth/me", undefined, loginCookie)).status).toBe(401);
  });
  it("blocks access when the Firebase account has been disabled or revoked", async () => {
    firebase.checkFirebaseSession.mockRejectedValue(new HttpError(401, "Sitzung widerrufen."));
    expect((await call("bots", undefined, cookie)).status).toBe(401);
  });
  it("checks CSRF and registration policy before creating a Firebase user", async () => {
    const data = { email: `${prefix}-blocked@example.test`, password, name: "Test", workspace: "Test" };
    expect((await call("auth/register", data, "", "https://other.test")).status).toBe(403);
    vi.stubEnv("ALLOW_REGISTRATION", "false");
    expect((await call("auth/register", data)).status).toBe(403);
    expect(firebase.createFirebaseUser).not.toHaveBeenCalled();
    vi.stubEnv("ALLOW_REGISTRATION", "true");
  });
  it("removes a just-created remote account if database provisioning fails", async () => {
    const remoteUid = `${prefix}-rollback`;
    firebase.createFirebaseUser.mockResolvedValue({ uid: remoteUid });
    const transaction = vi.spyOn(db, "$transaction").mockRejectedValueOnce(new Error("Simulated database write failure"));
    const response = await call("auth/register", { email: `${prefix}-rollback@example.test`, password, name: "Test", workspace: "Test" });
    transaction.mockRestore();
    expect(response.status).toBe(500);
    expect(firebase.removeFirebaseUser).toHaveBeenCalledWith(remoteUid);
    expect(await db.user.count({ where: { email: `${prefix}-rollback@example.test` } })).toBe(0);
  });
  it("keeps existing local accounts working without sending their password to Firebase", async () => {
    const local = await db.user.create({ data: { name: "Local", email: `${prefix}-local@example.test`, passwordHash: passwordHash(password) } });
    await db.workspace.create({ data: { name: "Local", members: { create: { userId: local.id } } } });
    expect((await call("auth/login", { email: local.email, password })).status).toBe(200);
    expect(firebase.signInFirebase).not.toHaveBeenCalled();
    expect((await db.user.findUniqueOrThrow({ where: { id: userId } })).firebaseUid).toBe(prefix);
  });
});
