import { describe, it, expect, beforeAll } from "vitest";
import {
  encrypt,
  decrypt,
  passwordHash,
  verifyPassword,
  domainAllowed,
  csrf,
} from "../src/lib/security";
import { updateBotSchema, chatSchema } from "../src/lib/validation";
beforeAll(() => {
  process.env.ENCRYPTION_KEY = "ab".repeat(32);
  process.env.APP_URL = "https://app.example.com";
});
describe("security boundaries", () => {
  it("authenticates encrypted secrets and rejects tampering", () => {
    const value = encrypt("secret-key");
    expect(value).not.toContain("secret-key");
    expect(decrypt(value)).toBe("secret-key");
    const parts = value.split(".");
    parts[1] = Buffer.alloc(16).toString("base64");
    expect(() => decrypt(parts.join("."))).toThrow();
  });
  it("salts passwords and rejects incorrect passwords", () => {
    const value = passwordHash("long-password");
    expect(verifyPassword("long-password", value)).toBe(true);
    expect(verifyPassword("wrong", value)).toBe(false);
    expect(passwordHash("long-password")).not.toBe(value);
  });
  it("requires exact domains and rejects missing origins", () => {
    expect(domainAllowed("https://shop.example.com", ["example.com"])).toBe(
      false,
    );
    expect(domainAllowed("https://example.com.evil.com", ["example.com"])).toBe(
      false,
    );
    expect(domainAllowed(null, ["example.com"])).toBe(false);
    expect(domainAllowed("https://example.com", ["example.com"])).toBe(true);
  });
  it("rejects CSRF without an exact app origin", () => {
    expect(() =>
      csrf(
        new Request("https://app.example.com", {
          headers: { origin: "https://evil.com" },
        }),
      ),
    ).toThrow();
    expect(() =>
      csrf(
        new Request("https://app.example.com", {
          headers: { origin: "https://app.example.com" },
        }),
      ),
    ).not.toThrow();
  });
  it("rejects hostile styling, oversized messages and fake session tokens", () => {
    expect(
      updateBotSchema.safeParse({
        widget: { primaryColor: "red;display:none" },
      }).success,
    ).toBe(false);
    expect(
      chatSchema.safeParse({ botId: "x", message: "a".repeat(4001) }).success,
    ).toBe(false);
    expect(
      chatSchema.safeParse({
        botId: "x",
        message: "hello",
        sessionToken: "guessed",
      }).success,
    ).toBe(false);
  });
});
