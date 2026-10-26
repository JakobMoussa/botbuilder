import { db } from "./lib/db";
import { indexSource } from "./lib/knowledge";
let running = true;
process.on("SIGTERM", () => {
  running = false;
});
process.on("SIGINT", () => {
  running = false;
});
async function retention() {
  await db.$executeRaw`DELETE FROM "Conversation" c USING "BotSettings" s WHERE c."botId" = s."botId" AND (NOT s."storeConversations" OR c."createdAt" < NOW() - s."retentionDays" * INTERVAL '1 day')`;
  await db.$executeRaw`DELETE FROM "UsageRecord" u USING "BotSettings" s WHERE u."botId" = s."botId" AND (NOT s."analyticsEnabled" OR u."createdAt" < NOW() - s."retentionDays" * INTERVAL '1 day')`;
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db.auditLog.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 90 * 86400000) } },
  });
  await db.knowledgeSource.updateMany({
    where: {
      status: "PROCESSING",
      lockedAt: { lt: new Date(Date.now() - 15 * 60000) },
    },
    data: {
      status: "ERROR",
      error: "Verarbeitung unterbrochen. Bitte erneut indexieren.",
      lockedAt: null,
    },
  });
}
async function main() {
  let lastCleanup = 0;
  while (running) {
    try {
      if (Date.now() - lastCleanup > 3600000) {
        await retention();
        lastCleanup = Date.now();
      }
      const jobs = await db.$queryRaw<
        { id: string }[]
      >`UPDATE "KnowledgeSource" SET "status" = 'PROCESSING', "lockedAt" = NOW() WHERE "id" = (SELECT "id" FROM "KnowledgeSource" WHERE "status" = 'QUEUED' ORDER BY "createdAt" FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING "id"`;
      if (jobs[0]) await indexSource(jobs[0].id);
      else await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch {
      console.error(
        "Worker cycle failed; retrying. No request content logged.",
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  await db.$disconnect();
}
void main();
