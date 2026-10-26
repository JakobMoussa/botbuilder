import { load } from "cheerio";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { providerFor } from "./providers";
import { HttpError } from "./security";
import { limitedText, safeFetch } from "./network";
export const embeddingKey = (providerId: string | null, model: string) => `${providerId || "environment"}:${model}`;
export function chunkText(text: string, size = 1800, overlap = 200) {
  const clean = text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const chunks: string[] = [];
  for (let start = 0; start < clean.length; ) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const boundary = clean.lastIndexOf(" ", end);
      if (boundary > start + size / 2) end = boundary;
    }
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}
async function fetchPage(
  input: string,
  hostname: string,
  depth = 0,
): Promise<{ url: string; html: string }> {
  if (new URL(input).hostname !== hostname || depth > 3)
    throw new HttpError(
      400,
      "Weiterleitung außerhalb der Domain oder zu viele Weiterleitungen.",
    );
  const response = await safeFetch(input, {
    headers: {
      "User-Agent": "DialogueBot/1.0",
      Accept: "text/html,text/plain",
    },
    timeout: 15000,
  });
  if (response.status >= 300 && response.status < 400) {
    await response.body?.cancel();
    return fetchPage(
      new URL(response.headers.get("location") || "", input).href,
      hostname,
      depth + 1,
    );
  }
  if (
    !response.ok ||
    !/text\/(html|plain)/i.test(response.headers.get("content-type") || "")
  ) {
    await response.body?.cancel();
    throw new HttpError(
      400,
      "Die URL liefert keine lesbare HTML- oder Textseite.",
    );
  }
  return { url: input, html: await limitedText(response) };
}
export async function crawl(input: string, multiple: boolean) {
  const base = new URL(input);
  const queue = [base.href],
    seen = new Set<string>(),
    documents: string[] = [];
  let total = 0;
  // Conservative robots handling: any disallowed path is excluded.
  let disallowed: string[] = [];
  try {
    const robots = await safeFetch(new URL("/robots.txt", base).href, {
      timeout: 10000,
    });
    if (robots.ok)
      disallowed = (await limitedText(robots, 100000))
        .split("\n")
        .map((x) => x.match(/^Disallow:\s*([^#\s]+)/i)?.[1])
        .filter((x): x is string => !!x);
    else {
      await robots.body?.cancel();
      if (robots.status !== 404) throw new Error("robots");
    }
  } catch {
    throw new HttpError(400, "robots.txt konnte nicht sicher geprüft werden.");
  }
  while (queue.length && seen.size < (multiple ? 20 : 1)) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);
    if (
      disallowed.some((path) =>
        new URL(current).pathname.startsWith(path.split("*")[0]),
      )
    )
      continue;
    const page = await fetchPage(current, base.hostname);
    const $ = load(page.html);
    $("script,style,nav,footer,header,aside,noscript,svg,form").remove();
    const text = $("main").text() || $("article").text() || $("body").text();
    total += text.length;
    if (total > 500000) break;
    documents.push(`Quelle: ${current}\n${text.replace(/\s+/g, " ").trim()}`);
    if (multiple)
      $("a[href]").each((_i, element) => {
        try {
          const url = new URL($(element).attr("href")!, page.url);
          url.hash = "";
          if (
            url.origin === base.origin &&
            !url.search &&
            !/\.(pdf|zip|png|jpg|jpeg|gif|docx)$/i.test(url.pathname) &&
            queue.length < 100 &&
            !seen.has(url.href)
          )
            queue.push(url.href);
        } catch {
          /* Invalid links are ignored. */
        }
      });
  }
  if (!documents.length)
    throw new HttpError(400, "Keine erlaubten Seiten gefunden.");
  return documents.join("\n\n");
}
export async function indexSource(id: string) {
  const source = await db.knowledgeSource.findUnique({
    where: { id },
    include: { bot: { include: { settings: true } } },
  });
  if (!source) return;
  try {
    const settings = source.bot.settings!;
    const provider = await providerFor(
      source.bot.workspaceId,
      settings.providerId,
    );
    const content = source.url
      ? await crawl(source.url, source.type === "CRAWL")
      : source.content;
    const chunks = chunkText(content).slice(0, 400);
    if (!chunks.length)
      throw new HttpError(
        400,
        "Die Quelle enthält keinen extrahierbaren Text.",
      );
    const records: { content: string; embedding: number[] }[] = [];
    let tokens = 0;
    for (let i = 0; i < chunks.length; i += 24) {
      const batch = chunks.slice(i, i + 24);
      const result = await provider.embeddings(batch, settings.embeddingModel);
      tokens += result.tokens;
      batch.forEach((content, n) =>
        records.push({ content, embedding: result.vectors[n] }),
      );
      await db.knowledgeSource.update({
        where: { id },
        data: { lockedAt: new Date() },
      });
    }
    await db.$transaction(
      async (tx) => {
        // Row lock serializes deletion/reindex with the atomic chunk replacement.
        await tx.$queryRaw`SELECT "id" FROM "KnowledgeSource" WHERE "id" = ${id} FOR UPDATE`;
        const current = await tx.botSettings.findUniqueOrThrow({ where: { botId: source.botId } });
        if (current.embeddingModel !== settings.embeddingModel || current.providerId !== settings.providerId) {
          await tx.knowledgeSource.update({ where: { id }, data: { status: "QUEUED", lockedAt: null } });
          return;
        }
        await tx.knowledgeChunk.deleteMany({
          where: { sourceId: id, botId: source.botId },
        });
        for (const record of records) {
          const vector = JSON.stringify(record.embedding);
          await tx.$executeRaw`INSERT INTO "KnowledgeChunk" ("id", "botId", "sourceId", "content", "embeddingModel", "embedding") VALUES (${randomUUID()}, ${source.botId}, ${id}, ${record.content}, ${embeddingKey(settings.providerId, settings.embeddingModel)}, ${vector}::vector)`;
        }
        await tx.knowledgeSource.update({
          where: { id },
          data: {
            status: "READY",
            indexedAt: new Date(),
            lockedAt: null,
            error: null,
          },
        });
        if (current.analyticsEnabled)
          await tx.usageRecord.create({
            data: {
              botId: source.botId,
              model: settings.embeddingModel,
              kind: "embedding",
              inputTokens: tokens,
              outputTokens: 0,
              cost: (tokens * settings.embeddingCostPerMillion) / 1e6,
              latencyMs: 0,
            },
          });
      },
      { timeout: 30000 },
    );
  } catch (error) {
    await db.knowledgeSource.updateMany({
      where: { id },
      data: {
        status: "ERROR",
        lockedAt: null,
        error:
          error instanceof HttpError
            ? error.message
            : "Indexierung fehlgeschlagen. Bitte Quelle und Provider prüfen.",
      },
    });
  }
}
export async function retrieve(
  botId: string,
  model: string,
  embedding: number[],
  threshold: number,
) {
  const vector = JSON.stringify(embedding);
  return db.$queryRaw<
    { id: string; content: string; source: string; score: number }[]
  >`
    SELECT c."id", c."content", s."name" as source, 1 - (c."embedding" <=> ${vector}::vector) as score
    FROM "KnowledgeChunk" c JOIN "KnowledgeSource" s ON c."sourceId" = s."id" AND c."botId" = s."botId"
    WHERE c."botId" = ${botId} AND c."embeddingModel" = ${model} AND s."status" = 'READY'
      AND 1 - (c."embedding" <=> ${vector}::vector) >= ${threshold}
    ORDER BY c."embedding" <=> ${vector}::vector LIMIT 5`;
}
