import { randomBytes } from "node:crypto";
import { db } from "./db";
import { ownedBot, type Auth } from "./auth";
import { chatSchema } from "./validation";
import {
  clientKey,
  domainAllowed,
  HttpError,
  jsonBody,
  rateLimit,
  sessionHash,
} from "./security";
import { providerFor, type ChatMessage } from "./providers";
import { embeddingKey, retrieve } from "./knowledge";
export async function publicBot(publicId: string, request: Request) {
  const bot = await db.bot.findUnique({
    where: { publicId },
    include: { settings: true, widget: true, domains: true },
  });
  if (!bot || !bot.active)
    throw new HttpError(404, "Dieser Chatbot ist nicht verfügbar.");
  if (
    !domainAllowed(
      request.headers.get("origin"),
      bot.domains.map((x) => x.domain),
    )
  )
    throw new HttpError(403, "Diese Domain ist nicht freigegeben.");
  return bot;
}
export function corsHeaders(request: Request) {
  return {
    "Access-Control-Allow-Origin": request.headers.get("origin") || "",
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
  };
}
export async function chat(request: Request, auth?: Auth) {
  const input = chatSchema.parse(await jsonBody(request));
  const preview = !!auth;
  const bot = auth
    ? await ownedBot(auth, input.botId)
    : await publicBot(input.botId, request);
  const settings = { ...bot.settings!, ...(preview ? input.settings : {}) };
  const token = input.sessionToken || randomBytes(32).toString("hex");
  const tokenHash = sessionHash(token);
  await rateLimit(`chat-ip:${bot.id}:${clientKey(request)}`, 60, 60);
  await rateLimit(`chat-session:${bot.id}:${tokenHash}`, 15, 60);
  await rateLimit(`chat-day:${bot.id}`, settings.dailyRequestLimit, 86400);
  let conversation = input.conversationId
    ? await db.conversation.findFirst({
        where: {
          id: input.conversationId,
          botId: bot.id,
          sessionHash: tokenHash,
          preview,
        },
      })
    : null;
  if (input.conversationId && !conversation)
    throw new HttpError(
      404,
      "Unterhaltung nicht gefunden. Bitte eine neue Unterhaltung starten.",
    );
  const history =
    conversation && settings.storeConversations
      ? await db.message.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: "desc" },
          take: 12,
        })
      : [];
  const provider = await providerFor(bot.workspaceId, settings.providerId);
  const started = Date.now();
  let chunks: Awaited<ReturnType<typeof retrieve>> = [],
    embeddingTokens = 0;
  if (
    await db.knowledgeChunk.count({
      where: { botId: bot.id, embeddingModel: embeddingKey(settings.providerId, settings.embeddingModel) },
    })
  ) {
    const embedding = await provider.embeddings(
      [input.message],
      settings.embeddingModel,
    );
    embeddingTokens = embedding.tokens;
    chunks = await retrieve(
      bot.id,
      embeddingKey(settings.providerId, settings.embeddingModel),
      embedding.vectors[0],
      settings.similarityThreshold,
    );
  }
  const context = chunks.length
    ? `\n<knowledge>\n${chunks
        .map((x, i) => `[${i + 1}] ${x.source}\n${x.content}`)
        .join("\n\n")}\n</knowledge>\n`
    : "";
  const system = `${settings.systemPrompt}\nAntworte auf ${settings.language}.${context ? `${context}\nNutze den obigen Kontext für Sachauskünfte. Falls eine Information weder im Kontext noch in deiner Anweisung enthalten ist, weise höflich darauf hin: "${settings.unknownAnswer}".` : `\nFalls du eine Information nicht weißt oder sie nicht in deiner Anweisung enthalten ist, weise höflich darauf hin: "${settings.unknownAnswer}".`}`;
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...history
      .reverse()
      .map((x) => ({
        role: x.role as "user" | "assistant",
        content: x.content,
      })),
    { role: "user", content: input.message },
  ];
  if (settings.storeConversations && !conversation)
    conversation = await db.conversation.create({
      data: { botId: bot.id, sessionHash: tokenHash, preview },
    });
  const conversationId = settings.storeConversations
    ? conversation?.id
    : undefined;
  const encoder = new TextEncoder();
  let cancelled = false;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        if (!cancelled) {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );
          } catch {
            cancelled = true;
          }
        }
      };
      send({ type: "meta", sessionToken: token, conversationId });
      let answer = "",
        inputTokens = 0,
        outputTokens = 0,
        estimated = false;
      try {
        let usageReceived = false;
        for await (const event of provider.chat({
          model: settings.model,
          messages,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        })) {
          if (event.text) {
            answer += event.text;
            send({ type: "delta", text: event.text });
          }
          if (event.inputTokens !== undefined) {
            inputTokens = event.inputTokens;
            outputTokens = event.outputTokens || 0;
            usageReceived = true;
          }
        }
        if (!usageReceived) {
          estimated = true;
          inputTokens = Math.ceil(
            messages.reduce((n, x) => n + x.content.length, 0) / 4,
          );
          outputTokens = Math.ceil(answer.length / 4);
        }
        const latencyMs = Date.now() - started;
        const cost =
          (inputTokens * settings.inputCostPerMillion +
            outputTokens * settings.outputCostPerMillion +
            embeddingTokens * settings.embeddingCostPerMillion) /
          1e6;
        const messageId = await db.$transaction(async (tx) => {
          // Re-check privacy settings: toggles changed during a stream take effect immediately.
          const current = await tx.botSettings.findUnique({
            where: { botId: bot.id },
          });
          let assistantId: string | undefined;
          const exists =
            conversationId && current?.storeConversations
              ? await tx.conversation.findUnique({
                  where: { id: conversationId },
                })
              : null;
          if (exists) {
            await tx.message.create({
              data: {
                conversationId: exists.id,
                role: "user",
                content: input.message,
              },
            });
            const assistant = await tx.message.create({
              data: {
                conversationId: exists.id,
                role: "assistant",
                content: answer,
              },
            });
            assistantId = assistant.id;
            await tx.conversation.update({
              where: { id: exists.id },
              data: { updatedAt: new Date() },
            });
          }
          if (current?.analyticsEnabled)
            await tx.usageRecord.create({
              data: {
                botId: bot.id,
                conversationId: exists?.id,
                model: settings.model,
                inputTokens: inputTokens + embeddingTokens,
                outputTokens,
                estimated,
                cost,
                latencyMs,
                matched: chunks.length > 0,
                preview,
              },
            });
          await tx.bot.update({
            where: { id: bot.id },
            data: { lastActivity: new Date() },
          });
          return assistantId;
        });
        send({
          type: "done",
          messageId,
          ...(preview
            ? {
                debug: {
                  model: settings.model,
                  chunks,
                  context,
                  inputTokens,
                  outputTokens,
                  embeddingTokens,
                  estimated,
                  cost,
                  latencyMs,
                },
              }
            : {}),
        });
      } catch (error) {
        send({
          type: "error",
          message:
            error instanceof HttpError
              ? error.message
              : "Antwort konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
        });
      } finally {
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      ...(preview ? {} : corsHeaders(request)),
    },
  });
}
