import { Prisma } from "@prisma/client";
import { db } from "./db";
import { HttpError } from "./security";
export function dateRange(url: URL) {
  const days = Number(url.searchParams.get("days") || 30);
  const end = url.searchParams.get("to")
    ? new Date(url.searchParams.get("to")! + "T23:59:59.999Z")
    : new Date();
  const start = url.searchParams.get("from")
    ? new Date(url.searchParams.get("from")!)
    : new Date(end.getTime() - days * 86400000);
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start > end ||
    end.getTime() - start.getTime() > 366 * 86400000
  )
    throw new HttpError(400, "Ungültiger Zeitraum (maximal 366 Tage).");
  return { gte: start, lte: end };
}
export async function analytics(workspaceId: string, url: URL, botId?: string) {
  const createdAt = dateRange(url);
  const bot = { workspaceId, ...(botId ? { id: botId } : {}) };
  const where = { bot, createdAt, preview: false };
  const [
    usage,
    conversations,
    messages,
    feedback,
    series,
    questions,
    weakQuestions,
    uniqueSessions,
  ] = await Promise.all([
    db.usageRecord.aggregate({
      where,
      _sum: { inputTokens: true, outputTokens: true, cost: true },
      _avg: { latencyMs: true },
      _count: true,
    }),
    db.conversation.count({ where }),
    db.message.count({
      where: { conversation: { bot, preview: false }, createdAt },
    }),
    db.message.groupBy({
      by: ["feedback"],
      where: {
        conversation: { bot, preview: false },
        createdAt,
        feedback: { not: null },
      },
      _count: true,
    }),
    db.$queryRaw<
      { date: string; messages: number; cost: number }[]
    >`SELECT to_char(u."createdAt", 'YYYY-MM-DD') as date, (COUNT(*) FILTER (WHERE u."kind" = 'chat') * 2)::int as messages, SUM(u."cost")::float as cost FROM "UsageRecord" u JOIN "Bot" b ON b."id" = u."botId" WHERE b."workspaceId" = ${workspaceId} ${botId ? Prisma.sql`AND b."id" = ${botId}` : Prisma.empty} AND u."preview" = false AND u."createdAt" BETWEEN ${createdAt.gte} AND ${createdAt.lte} GROUP BY date ORDER BY date`,
    db.message.groupBy({
      by: ["content"],
      where: { role: "user", conversation: { bot, preview: false }, createdAt },
      _count: true,
      orderBy: { _count: { content: "desc" } },
      take: 8,
    }),
    db.message.findMany({
      where: {
        role: "user",
        createdAt,
        conversation: {
          bot,
          preview: false,
          usage: { some: { matched: false, createdAt } },
        },
      },
      select: { content: true, createdAt: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    db.$queryRaw<
      { count: number }[]
    >`SELECT COUNT(DISTINCT c."sessionHash")::int as count FROM "Conversation" c JOIN "Bot" b ON b."id" = c."botId" WHERE b."workspaceId" = ${workspaceId} ${botId ? Prisma.sql`AND b."id" = ${botId}` : Prisma.empty} AND c."preview" = false AND c."createdAt" BETWEEN ${createdAt.gte} AND ${createdAt.lte}`,
  ]);
  return {
    conversations,
    messages,
    uniqueSessions: uniqueSessions[0]?.count || 0,
    tokens: (usage._sum.inputTokens || 0) + (usage._sum.outputTokens || 0),
    cost: usage._sum.cost || 0,
    latencyMs: Math.round(usage._avg.latencyMs || 0),
    series,
    questions: questions.map((x) => ({ content: x.content, count: x._count })),
    weakQuestions,
    feedback,
    requests: usage._count,
  };
}
