import { randomBytes } from "node:crypto";
import { db } from "./db";
import { HttpError, sessionHash } from "./security";
import { checkFirebaseSession } from "./firebase-auth";
export async function requireAuth(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("dialogue_session="))
    ?.slice(17);
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    throw new HttpError(401, "Bitte melde dich an.");
  const session = await db.session.findUnique({
    where: { id: sessionHash(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date())
    throw new HttpError(401, "Sitzung abgelaufen.");
  if (session.user.firebaseUid)
    await checkFirebaseSession(session.user.firebaseUid, session.authenticatedAt);
  const member = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.userId,
        workspaceId: session.workspaceId,
      },
    },
    include: { workspace: true },
  });
  if (!member) throw new HttpError(403, "Kein Zugriff auf diesen Workspace.");
  return {
    user: session.user,
    workspace: member.workspace,
    role: member.role,
    sessionId: session.id,
  };
}
export type Auth = Awaited<ReturnType<typeof requireAuth>>;
export function requireOwner(auth: Auth) {
  if (auth.role !== "OWNER")
    throw new HttpError(
      403,
      "Nur Workspace-Eigentümer können diese Aktion ausführen.",
    );
}
export async function ownedBot(auth: Auth, id: string) {
  const bot = await db.bot.findFirst({
    where: { id, workspaceId: auth.workspace.id },
    include: {
      settings: true,
      widget: true,
      domains: true,
      _count: { select: { sources: true, conversations: true } },
    },
  });
  if (!bot) throw new HttpError(404, "Chatbot nicht gefunden.");
  return bot;
}
export async function createSession(userId: string, workspaceId: string, authenticatedAt?: Date) {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      id: sessionHash(token),
      userId,
      workspaceId,
      authenticatedAt,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });
  return `dialogue_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${process.env.APP_URL?.startsWith("https:") ? "; Secure" : ""}`;
}
export function audit(auth: Auth, action: string, targetId?: string) {
  return db.auditLog.create({
    data: {
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      action,
      targetId,
    },
  });
}
