import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../src/lib/db";
import { createSession } from "../src/lib/auth";
import { encrypt, passwordHash } from "../src/lib/security";
import { handleApi } from "../src/lib/api";
import { indexSource } from "../src/lib/knowledge";
const embedding = Array.from({ length: 1536 }, (_, i) => (i === 0 ? 1 : 0));
vi.mock("../src/lib/providers", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../src/lib/providers")>();
  return {
    ...original,
    providerFor: async () => ({
      async embeddings(texts: string[]) {
        return {
          vectors: texts.map(() => embedding),
          tokens: texts.length * 12,
        };
      },
      async *chat() {
        yield { text: "Unsere Öffnungszeiten: " };
        yield { text: "Montag bis Freitag." };
        yield { inputTokens: 50, outputTokens: 10 };
      },
    }),
  };
});
type BotResult = {
  id: string;
  publicId: string;
  settings: { botId: string };
  widget: { greeting: string };
};
const fixture = {
  users: [] as string[],
  workspaces: [] as string[],
  cookies: [] as string[],
  bots: [] as BotResult[],
};
async function call(
  path: string,
  method = "GET",
  body?: unknown,
  tenant = 0,
  origin = "http://localhost:3000",
) {
  return handleApi(
    new Request(`http://localhost:3000/api/${path}`, {
      method,
      headers: {
        origin,
        cookie: fixture.cookies[tenant] || "",
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    path.split("/"),
  );
}
beforeAll(async () => {
  process.env.APP_URL = "http://localhost:3000";
  process.env.AUTH_SECRET ||= "integration-auth-secret-at-least-32-characters";
  process.env.ENCRYPTION_KEY ||= "cd".repeat(32);
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL required for integration tests.");
  for (let i = 0; i < 2; i++) {
    const user = await db.user.create({
      data: {
        email: `test-${randomUUID()}@example.test`,
        name: "Integration Test",
        passwordHash: passwordHash("integration-test-password"),
      },
    });
    const workspace = await db.workspace.create({
      data: {
        name: "Integration Fixture",
        members: { create: { userId: user.id } },
      },
    });
    fixture.users.push(user.id);
    fixture.workspaces.push(workspace.id);
    fixture.cookies.push(
      (await createSession(user.id, workspace.id)).split(";")[0],
    );
    const response = await call(
      "bots",
      "POST",
      { name: `Fixture Bot ${i}` },
      i,
    );
    expect(response.status).toBe(201);
    fixture.bots.push(await response.json());
  }
});
afterAll(async () => {
  await db.workspace.deleteMany({ where: { id: { in: fixture.workspaces } } });
  await db.user.deleteMany({ where: { id: { in: fixture.users } } });
  await db.$disconnect();
});
describe.sequential("real PostgreSQL + pgvector API integration", () => {
  it("requires authentication and rejects forged admin origins", async () => {
    expect((await call("bots", "GET", undefined, 99)).status).toBe(401);
    expect(
      (await call("bots", "POST", { name: "Forged" }, 0, "https://evil.test"))
        .status,
    ).toBe(403);
  });
  it("isolates reads, writes, analytics, source access and deletion across tenants", async () => {
    const other = fixture.bots[1];
    for (const [suffix, method, body] of [
      ["", "GET", undefined],
      ["", "PATCH", { name: "Leaked" }],
      ["", "DELETE", undefined],
      ["/analytics", "GET", undefined],
      ["/knowledge", "GET", undefined],
      ["/conversations", "GET", undefined],
      ["/export", "GET", undefined],
    ] as const)
      expect(
        (await call(`bots/${other.id}${suffix}`, method, body)).status,
      ).toBe(404);
    const bots = await (await call("bots")).json();
    expect(bots).toHaveLength(1);
    expect(bots[0].id).toBe(fixture.bots[0].id);
  });
  it("never returns encrypted or plaintext API keys and rejects a foreign provider assignment", async () => {
    const credential = await db.aIProviderCredential.create({
      data: {
        workspaceId: fixture.workspaces[1],
        name: "Fixture Secret",
        encryptedKey: encrypt("fixture-key-never-public"),
        keyLastFour: "blic",
      },
    });
    const response = await call("providers", "GET", undefined, 1);
    const text = await response.text();
    expect(text).not.toContain("encryptedKey");
    expect(text).not.toContain("fixture-key-never-public");
    expect(
      (
        await call(`bots/${fixture.bots[0].id}`, "PATCH", {
          settings: { providerId: credential.id },
        })
      ).status,
    ).toBe(400);
  });
  it("requires allowed domains before publication and denies lookalike domains", async () => {
    const bot = fixture.bots[0];
    expect(
      (await call(`bots/${bot.id}`, "PATCH", { active: true })).status,
    ).toBe(400);
    expect(
      (
        await call(`bots/${bot.id}`, "PATCH", {
          active: true,
          domains: ["website.example"],
          settings: { inputCostPerMillion: 1, outputCostPerMillion: 2 },
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await call(
          `public/config/${bot.publicId}`,
          "GET",
          undefined,
          99,
          "https://website.example.evil.test",
        )
      ).status,
    ).toBe(403);
    const config = await call(
      `public/config/${bot.publicId}`,
      "GET",
      undefined,
      99,
      "https://website.example",
    );
    expect(config.status).toBe(200);
    const text = await config.text();
    expect(text).toContain("greeting");
    expect(text).not.toContain("systemPrompt");
    expect(text).not.toContain("providerId");
  });
  it("indexes knowledge atomically into pgvector and scopes retrieval to the bot", async () => {
    for (let i = 0; i < 2; i++) {
      const response = await call(
        `bots/${fixture.bots[i].id}/knowledge`,
        "POST",
        {
          name: "Hours",
          type: "TEXT",
          content: i
            ? "TOP_SECRET_OTHER_TENANT"
            : "Unsere Öffnungszeiten sind Montag bis Freitag.",
        },
        i,
      );
      expect(response.status).toBe(201);
      const source = await response.json();
      await indexSource(source.id);
      const saved = await db.knowledgeSource.findUniqueOrThrow({
        where: { id: source.id },
        include: { _count: { select: { chunks: true } } },
      });
      expect(saved.status).toBe("READY");
      expect(saved._count.chunks).toBeGreaterThan(0);
    }
  });
  it("streams answers, stores usage, protects session capabilities and strips public debug", async () => {
    const bot = fixture.bots[0];
    const response = await call(
      "public/chat",
      "POST",
      { botId: bot.publicId, message: "Wann habt ihr geöffnet?" },
      99,
      "https://website.example",
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const text = await response.text();
    expect(text).toContain("Montag bis Freitag");
    expect(text).not.toContain("debug");
    expect(text).not.toContain("TOP_SECRET");
    const events = text
      .trim()
      .split("\n\n")
      .map((x) => JSON.parse(x.slice(6)));
    const meta = events[0];
    const done = events.find((x) => x.type === "done");
    expect(done.messageId).toBeTruthy();
    const stored = await db.conversation.findUniqueOrThrow({
      where: { id: meta.conversationId },
      include: { messages: true, usage: true },
    });
    expect(stored.messages).toHaveLength(2);
    expect(stored.usage[0].inputTokens).toBe(62);
    expect(stored.usage[0].cost).toBeGreaterThan(0);
    expect(
      (
        await call(
          "public/chat",
          "POST",
          {
            botId: bot.publicId,
            message: "Weiter",
            conversationId: meta.conversationId,
            sessionToken: "00".repeat(32),
          },
          99,
          "https://website.example",
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await call(
          "public/feedback",
          "POST",
          {
            botId: bot.publicId,
            messageId: done.messageId,
            sessionToken: meta.sessionToken,
            feedback: 1,
          },
          99,
          "https://website.example",
        )
      ).status,
    ).toBe(200);
    const preview = await call("playground", "POST", {
      botId: bot.id,
      message: "Test mit Debug",
    });
    const previewText = await preview.text();
    expect(previewText).toContain('"debug"');
    expect(previewText).not.toContain("TOP_SECRET_OTHER_TENANT");
  });
  it("keeps preview traffic out of analytics and supports privacy deletion", async () => {
    const bot = fixture.bots[0];
    const data = await (await call(`bots/${bot.id}/analytics`)).json();
    expect(data.conversations).toBe(1);
    expect(data.messages).toBe(2);
    expect(data.feedback[0]._count).toBe(1);
    await call(`bots/${bot.id}`, "PATCH", {
      settings: { storeConversations: false, analyticsEnabled: false },
    });
    expect(await db.conversation.count({ where: { botId: bot.id } })).toBe(0);
    expect(await db.usageRecord.count({ where: { botId: bot.id } })).toBe(0);
    const response = await call(
      "public/chat",
      "POST",
      { botId: bot.publicId, message: "Ohne Speicherung" },
      99,
      "https://website.example",
    );
    expect(await response.text()).toContain("Montag bis Freitag");
    expect(await db.conversation.count({ where: { botId: bot.id } })).toBe(0);
    expect(await db.usageRecord.count({ where: { botId: bot.id } })).toBe(0);
  });
  it("duplicates to an inactive isolated bot and cascades bot deletion", async () => {
    const original = fixture.bots[0];
    const copy = await (
      await call(`bots/${original.id}/duplicate`, "POST", {})
    ).json();
    expect(copy.active).toBe(false);
    expect(copy.publicId).not.toBe(original.publicId);
    expect(await db.knowledgeSource.count({ where: { botId: copy.id } })).toBe(
      1,
    );
    await call(`bots/${copy.id}`, "DELETE");
    expect(await db.knowledgeSource.count({ where: { botId: copy.id } })).toBe(
      0,
    );
    await call(`bots/${original.id}`, "DELETE");
    expect(
      await db.knowledgeChunk.count({ where: { botId: original.id } }),
    ).toBe(0);
  });
});
