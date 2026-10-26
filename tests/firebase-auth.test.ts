import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  configured: vi.fn(), createUser: vi.fn(), deleteUser: vi.fn(),
  verifyIdToken: vi.fn(), getUser: vi.fn(),
}));
vi.mock("../src/lib/firebase", () => ({
  isFirebaseConfigured: mocks.configured,
  getFirebaseApp: () => ({}),
}));
vi.mock("firebase-admin/auth", () => ({ getAuth: () => mocks }));
import { checkFirebaseSession, createFirebaseUser, firebaseAuthReady, signInFirebase } from "../src/lib/firebase-auth";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("FIREBASE_WEB_API_KEY", "test-web-key");
  mocks.configured.mockReturnValue(true);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("Firebase authentication boundary", () => {
  it("requires both admin credentials and a web API key", async () => {
    vi.stubEnv("FIREBASE_WEB_API_KEY", "");
    expect(firebaseAuthReady()).toBe(false);
    await expect(signInFirebase("a@example.test", "password")).rejects.toMatchObject({ status: 503 });
    expect(mocks.verifyIdToken).not.toHaveBeenCalled();
  });
  it("checks the returned ID token and revocation before returning its UID", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ idToken: "test-id-token", refreshToken: "not-persisted" }));
    vi.stubGlobal("fetch", fetch);
    mocks.verifyIdToken.mockResolvedValue({ uid: "uid-1", email: "a@example.test", auth_time: 1791115200, firebase: { sign_in_provider: "password" } });
    expect(await signInFirebase("a@example.test", "correct-password")).toEqual({ uid: "uid-1", authenticatedAt: new Date(1791115200000) });
    expect(mocks.verifyIdToken).toHaveBeenCalledWith("test-id-token", true);
    expect(fetch.mock.calls[0][1].redirect).toBe("error");
  });
  it("rejects an identity whose verified email does not match", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ idToken: "test-id-token" })));
    mocks.verifyIdToken.mockResolvedValue({ uid: "uid-2", email: "other@example.test", firebase: { sign_in_provider: "password" } });
    await expect(signInFirebase("a@example.test", "password")).rejects.toMatchObject({ status: 401 });
  });
  it.each(["INVALID_LOGIN_CREDENTIALS", "USER_DISABLED", "EMAIL_NOT_FOUND"])("sanitizes Firebase rejection %s", async (message) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { message } }, { status: 400 })));
    await expect(signInFirebase("a@example.test", "password")).rejects.toMatchObject({ status: 401, message: "E-Mail oder Passwort ist nicht korrekt." });
    expect(mocks.verifyIdToken).not.toHaveBeenCalled();
  });
  it("keeps tokens and API key URLs out of network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("private-token-at-provider")));
    await expect(signInFirebase("a@example.test", "password")).rejects.toMatchObject({ status: 503 });
    try { await signInFirebase("a@example.test", "password"); }
    catch (error) { expect(String(error)).not.toContain("private-token"); }
  });
  it("does not overwrite an existing Firebase identity on registration", async () => {
    mocks.createUser.mockRejectedValue({ code: "auth/email-already-exists" });
    await expect(createFirebaseUser("a@example.test", "password", "Test")).rejects.toMatchObject({ status: 409 });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
  it("rejects disabled, deleted and revoked accounts after login", async () => {
    const created = new Date("2026-10-04T12:00:00Z");
    mocks.getUser.mockResolvedValue({ disabled: true });
    await expect(checkFirebaseSession("uid", created)).rejects.toMatchObject({ status: 401 });
    mocks.getUser.mockRejectedValue({ code: "auth/user-not-found" });
    await expect(checkFirebaseSession("uid", created)).rejects.toMatchObject({ status: 401 });
    mocks.getUser.mockResolvedValue({ disabled: false, tokensValidAfterTime: "2026-10-04T12:01:00Z" });
    await expect(checkFirebaseSession("uid", created)).rejects.toMatchObject({ status: 401 });
    mocks.getUser.mockResolvedValue({ disabled: false, tokensValidAfterTime: "2026-10-04T11:59:00Z" });
    await expect(checkFirebaseSession("uid", created)).resolves.toBeUndefined();
  });
  it("does not permit a session during a Firebase outage", async () => {
    mocks.getUser.mockRejectedValue({ code: "app/network-error" });
    await expect(checkFirebaseSession("uid", new Date())).rejects.toMatchObject({ status: 503 });
  });
});
