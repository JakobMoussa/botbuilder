import { db } from "./db";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase";
import { HttpError } from "./security";

export interface BackupStats {
  botsCount: number;
  sourcesCount: number;
  chunksCount: number;
  conversationsCount: number;
  messagesCount: number;
  providersCount: number;
}

export interface BackupSummary {
  id: string;
  workspaceId: string;
  label: string;
  createdAt: string;
  stats: BackupStats;
  sizeBytes: number;
}

export async function createWorkspaceCloudBackup(
  workspaceId: string,
  label = "Manuelles Backup",
): Promise<BackupSummary> {
  if (!isFirebaseConfigured()) {
    throw new HttpError(
      503,
      "Firebase ist nicht konfiguriert. Cloud-Backup kann nicht erstellt werden.",
    );
  }

  const firestore = getFirestoreDb();

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      bots: {
        include: {
          settings: true,
          sources: true,
          conversations: {
            include: {
              messages: {
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
      credentials: {
        select: {
          id: true,
          name: true,
          baseUrl: true,
          keyLastFour: true,
          createdAt: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new HttpError(404, "Workspace nicht gefunden.");
  }

  // Fetch knowledge chunks for all bots in this workspace
  const botIds = workspace.bots.map((b) => b.id);
  const chunks = await db.knowledgeChunk.findMany({
    where: { botId: { in: botIds } },
    select: {
      id: true,
      botId: true,
      sourceId: true,
      content: true,
      embeddingModel: true,
    },
  });

  // Calculate statistics
  let totalMessages = 0;
  let totalConversations = 0;
  let totalSources = 0;

  for (const bot of workspace.bots) {
    totalSources += bot.sources.length;
    totalConversations += bot.conversations.length;
    for (const conv of bot.conversations) {
      totalMessages += conv.messages.length;
    }
  }

  const stats: BackupStats = {
    botsCount: workspace.bots.length,
    sourcesCount: totalSources,
    chunksCount: chunks.length,
    conversationsCount: totalConversations,
    messagesCount: totalMessages,
    providersCount: workspace.credentials.length,
  };

  const backupData = {
    version: "1.0.0",
    workspaceId,
    workspaceName: workspace.name,
    createdAt: new Date().toISOString(),
    label,
    stats,
    data: {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        createdAt: workspace.createdAt.toISOString(),
      },
      bots: workspace.bots.map((bot) => ({
        id: bot.id,
        publicId: bot.publicId,
        name: bot.name,
        description: bot.description,
        active: bot.active,
        createdAt: bot.createdAt.toISOString(),
        settings: bot.settings,
        sources: bot.sources.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          status: s.status,
          error: s.error,
          indexedAt: s.indexedAt?.toISOString() || null,
          content: s.content,
        })),
        conversations: bot.conversations.map((c) => ({
          id: c.id,
          sessionHash: c.sessionHash,
          preview: c.preview,
          createdAt: c.createdAt.toISOString(),
          messages: c.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            feedback: m.feedback,
            createdAt: m.createdAt.toISOString(),
          })),
        })),
      })),
      chunks,
      providers: workspace.credentials,
    },
  };

  const serialized = JSON.stringify(backupData);
  const sizeBytes = Buffer.byteLength(serialized, "utf8");

  // Store in Firestore
  const backupDocRef = firestore
    .collection("workspaces")
    .doc(workspaceId)
    .collection("backups")
    .doc();

  const backupSummary: BackupSummary = {
    id: backupDocRef.id,
    workspaceId,
    label,
    createdAt: backupData.createdAt,
    stats,
    sizeBytes,
  };

  await backupDocRef.set({
    ...backupSummary,
    payload: backupData,
  });

  return backupSummary;
}

export async function listWorkspaceCloudBackups(
  workspaceId: string,
): Promise<BackupSummary[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const firestore = getFirestoreDb();
  const snapshot = await firestore
    .collection("workspaces")
    .doc(workspaceId)
    .collection("backups")
    .orderBy("createdAt", "desc")
    .limit(25)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId,
      label: data.label || "Backup",
      createdAt: data.createdAt,
      stats: data.stats || {
        botsCount: 0,
        sourcesCount: 0,
        chunksCount: 0,
        conversationsCount: 0,
        messagesCount: 0,
        providersCount: 0,
      },
      sizeBytes: data.sizeBytes || 0,
    };
  });
}

export async function deleteWorkspaceCloudBackup(
  workspaceId: string,
  backupId: string,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new HttpError(503, "Firebase ist nicht konfiguriert.");
  }

  const firestore = getFirestoreDb();
  await firestore
    .collection("workspaces")
    .doc(workspaceId)
    .collection("backups")
    .doc(backupId)
    .delete();
}
