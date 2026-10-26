import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import {
  audit,
  createSession,
  ownedBot,
  requireAuth,
  requireOwner,
} from "./auth";
import {
  clientKey,
  csrf,
  encrypt,
  HttpError,
  jsonBody,
  passwordHash,
  rateLimit,
  sessionHash,
  verifyPassword,
} from "./security";
import {
  botSchema,
  loginSchema,
  providerSchema,
  registerSchema,
  sourceSchema,
  updateBotSchema,
} from "./validation";
import { OpenAICompatibleProvider, providerFor } from "./providers";
import { chat, corsHeaders, publicBot } from "./chat";
import { analytics } from "./analytics";
import { extractUpload } from "./uploads";
import {
  createWorkspaceCloudBackup,
  listWorkspaceCloudBackups,
  deleteWorkspaceCloudBackup,
} from "./backup";
import { isFirebaseConfigured } from "./firebase";
import {
  createFirebaseUser,
  firebaseAuthEnabled,
  firebaseAuthReady,
  removeFirebaseUser,
  signInFirebase,
} from "./firebase-auth";
const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
const providerSelect = {
  id: true,
  name: true,
  kind: true,
  baseUrl: true,
  keyLastFour: true,
  createdAt: true,
} as const;
export async function handleApi(request: Request, path: string[]) {
  try {
    return await route(request, path);
  } catch (error) {
    const headers = path[0] === "public" ? corsHeaders(request) : {};
    if (error instanceof ZodError)
      return json(
        {
          error: error.issues
            .map((x) => `${x.path.join(".")}: ${x.message}`)
            .join("; "),
        },
        400,
        headers,
      );
    if (error instanceof HttpError)
      return json({ error: error.message }, error.status, headers);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return json({ error: "Dieser Eintrag existiert bereits." }, 409);
    // Intentionally do not log request bodies, prompts or provider errors.
    console.error(
      "API failure",
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : error instanceof Error
          ? error.name
          : "Unknown",
    );
    return json(
      {
        error:
          "Die Anfrage konnte nicht verarbeitet werden. Bitte Datenbank und Server-Konfiguration prüfen.",
      },
      500,
    );
  }
}
async function route(request: Request, path: string[]): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);
  const [root, id, action, child] = path;
  if (root === "health") {
    await db.$queryRaw`SELECT 1`;
    return json({ status: "ok" });
  }
  if (root === "public") {
    if (method === "OPTIONS")
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    if (id === "chat" && method === "POST") return chat(request);
    if (id === "config" && action && method === "GET") {
      const bot = await publicBot(action, request);
      await rateLimit(`config:${bot.id}:${clientKey(request)}`, 120, 60);
      const { botId: _botId, ...widget } = bot.widget!;
      void _botId;
      return json(widget, 200, corsHeaders(request));
    }
    if (id === "feedback" && method === "POST") {
      const input = z
        .object({
          botId: z.string(),
          sessionToken: z.string().regex(/^[a-f0-9]{64}$/),
          messageId: z.string(),
          feedback: z.union([z.literal(1), z.literal(-1)]),
        })
        .parse(await jsonBody(request));
      const bot = await publicBot(input.botId, request);
      await rateLimit(`feedback:${bot.id}:${clientKey(request)}`, 60, 60);
      const updated = await db.message.updateMany({
        where: {
          id: input.messageId,
          role: "assistant",
          conversation: {
            botId: bot.id,
            sessionHash: sessionHash(input.sessionToken),
            preview: false,
          },
        },
        data: { feedback: input.feedback },
      });
      if (!updated.count) throw new HttpError(404, "Nachricht nicht gefunden.");
      return json({ ok: true }, 200, corsHeaders(request));
    }
    throw new HttpError(404, "Endpunkt nicht gefunden.");
  }
  if (root === "auth" && id === "status" && method === "GET")
    return json({
      registrationOpen:
        process.env.ALLOW_REGISTRATION === "true" ||
        (await db.user.count()) === 0,
      authProvider: firebaseAuthEnabled() ? "firebase" : "local",
      firebaseReady: firebaseAuthEnabled() && firebaseAuthReady(),
    });
  if (!["GET", "HEAD"].includes(method)) csrf(request);
  if (
    root === "auth" &&
    ["register", "login"].includes(id) &&
    method === "POST"
  ) {
    await rateLimit(`auth:${clientKey(request)}`, 10, 600);
    const body = await jsonBody(request);
    if (id === "register") {
      const data = registerSchema.parse(body);
      // Check before creating a remote account; the transaction checks again
      // under the same lock as local registrations to protect first-user setup.
      if (process.env.ALLOW_REGISTRATION !== "true" && (await db.user.count()) > 0)
        throw new HttpError(403, "Registrierung ist geschlossen.");
      if (await db.user.findUnique({ where: { email: data.email } }))
        throw new HttpError(409, "Dieses Konto existiert bereits. Bitte melde dich an.");
      const firebaseUser = firebaseAuthEnabled()
        ? await createFirebaseUser(data.email, data.password, data.name)
        : null;
      const encoded = firebaseUser ? null : passwordHash(data.password);
      let result;
      try {
        result = await db.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(781246)`;
        if (
          process.env.ALLOW_REGISTRATION !== "true" &&
          (await tx.user.count()) > 0
        )
          throw new HttpError(403, "Registrierung ist geschlossen.");
        const user = await tx.user.create({
          data: { name: data.name, email: data.email, passwordHash: encoded, firebaseUid: firebaseUser?.uid },
        });
        const workspace = await tx.workspace.create({
          data: {
            name: data.workspace,
            members: { create: { userId: user.id } },
          },
        });
        return { user, workspace };
        });
      } catch (error) {
        if (firebaseUser) {
          try { await removeFirebaseUser(firebaseUser.uid); }
          catch {
            // No passwords, tokens or user details in logs.
            console.error("Firebase registration rollback failed; check Firebase Authentication for an unlinked account.");
          }
        }
        throw error;
      }
      return json({ ok: true }, 201, {
        "Set-Cookie": await createSession(
          result.user.id,
          result.workspace.id,
          firebaseUser ? new Date(firebaseUser.metadata.creationTime) : undefined,
        ),
      });
    }
    const data = loginSchema.parse(body);
    const user = await db.user.findUnique({
      where: { email: data.email },
      include: { memberships: true },
    });
    // Existing local accounts keep their current sign-in. Firebase accounts
    // never fall back to a local password or link to an account by email alone.
    const firebaseIdentity = user?.firebaseUid
      ? await signInFirebase(data.email, data.password)
      : null;
    const valid = firebaseIdentity
      ? firebaseIdentity.uid === user?.firebaseUid
      : verifyPassword(
          data.password,
          user?.passwordHash || "00000000000000000000000000000000:" + "00".repeat(64),
        );
    if (!user || !valid || !user.memberships[0])
      throw new HttpError(401, "E-Mail oder Passwort ist nicht korrekt.");
    return json({ ok: true }, 200, {
      "Set-Cookie": await createSession(
        user.id,
        user.memberships[0].workspaceId,
        firebaseIdentity?.authenticatedAt,
      ),
    });
  }
  const auth = await requireAuth(request);
  await rateLimit(`admin:${auth.user.id}`, 300, 60);
  if (root === "auth" && id === "me" && method === "GET")
    return json({
      user: { id: auth.user.id, name: auth.user.name, email: auth.user.email, authProvider: auth.user.firebaseUid ? "firebase" : "local" },
      workspace: auth.workspace,
    });
  if (root === "auth" && id === "logout" && method === "POST") {
    await db.session.delete({ where: { id: auth.sessionId } });
    return json({ ok: true }, 200, {
      "Set-Cookie":
        "dialogue_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0",
    });
  }
  if (root === "workspace") {
    if (method === "GET")
      return json(
        await db.workspaceMember.findMany({
          where: { userId: auth.user.id },
          include: { workspace: true },
        }),
      );
    if (method === "PATCH") {
      requireOwner(auth);
      const data = z
        .object({ name: z.string().trim().min(2).max(100) })
        .parse(await jsonBody(request));
      await audit(auth, "workspace.update");
      return json(
        await db.workspace.update({ where: { id: auth.workspace.id }, data }),
      );
    }
    if (method === "POST") {
      const data = z
        .object({ name: z.string().trim().min(2).max(100) })
        .parse(await jsonBody(request));
      const workspace = await db.workspace.create({
        data: {
          name: data.name,
          members: { create: { userId: auth.user.id } },
        },
      });
      await db.session.update({
        where: { id: auth.sessionId },
        data: { workspaceId: workspace.id },
      });
      return json(workspace, 201);
    }
    if (method === "PUT") {
      const data = z.object({ id: z.string() }).parse(await jsonBody(request));
      const member = await db.workspaceMember.findUnique({
        where: {
          userId_workspaceId: { userId: auth.user.id, workspaceId: data.id },
        },
      });
      if (!member) throw new HttpError(403, "Kein Zugriff.");
      await db.session.update({
        where: { id: auth.sessionId },
        data: { workspaceId: data.id },
      });
      return json({ ok: true });
    }
  }
  if (root === "providers") {
    requireOwner(auth);
    if (method === "GET" && !id)
      return json({
        providers: await db.aIProviderCredential.findMany({
          where: { workspaceId: auth.workspace.id },
          select: providerSelect,
        }),
        environmentKey: !!process.env.OPENAI_API_KEY,
      });
    if (method === "POST" && !id) {
      const data = providerSchema.parse(await jsonBody(request));
      await new OpenAICompatibleProvider(
        data.apiKey,
        data.baseUrl,
      ).validateCredentials();
      const provider = await db.aIProviderCredential.create({
        data: {
          name: data.name,
          baseUrl: data.baseUrl,
          workspaceId: auth.workspace.id,
          encryptedKey: encrypt(data.apiKey),
          keyLastFour: data.apiKey.slice(-4),
        },
        select: providerSelect,
      });
      await audit(auth, "provider.create", provider.id);
      return json(provider, 201);
    }
    if (id && action === "models" && method === "GET")
      return json(
        await (
          await providerFor(auth.workspace.id, id === "environment" ? null : id)
        ).getModels(),
      );
    if (id && method === "DELETE") {
      const used = await db.botSettings.count({
        where: { providerId: id, bot: { workspaceId: auth.workspace.id } },
      });
      if (used)
        throw new HttpError(
          409,
          "Provider wird noch von Bots verwendet. Bitte zuerst die Zuordnung ändern.",
        );
      await db.aIProviderCredential.deleteMany({
        where: { id, workspaceId: auth.workspace.id },
      });
      await audit(auth, "provider.delete", id);
      return json({ ok: true });
    }
  }
  if (root === "backups") {
    requireOwner(auth);
    if (method === "GET" && !id) {
      return json({
        configured: isFirebaseConfigured(),
        backups: await listWorkspaceCloudBackups(auth.workspace.id),
      });
    }
    if (method === "POST" && !id) {
      const body = (await jsonBody(request).catch(() => ({}))) as { label?: string };
      const label = typeof body?.label === "string" && body.label.trim() ? body.label.trim() : "Manuelles Cloud-Backup";
      const result = await createWorkspaceCloudBackup(auth.workspace.id, label);
      await audit(auth, "backup.create", result.id);
      return json(result, 201);
    }
    if (id && method === "DELETE") {
      await deleteWorkspaceCloudBackup(auth.workspace.id, id);
      await audit(auth, "backup.delete", id);
      return json({ ok: true });
    }
  }
  if (root === "analytics" && method === "GET")
    return json(await analytics(auth.workspace.id, url));
  if (root === "audit" && method === "GET")
    return json(
      await db.auditLog.findMany({
        where: { workspaceId: auth.workspace.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    );
  if (root === "knowledge" && method === "GET")
    return json(
      await db.knowledgeSource.findMany({
        where: { bot: { workspaceId: auth.workspace.id } },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          indexedAt: true,
          error: true,
          bot: { select: { id: true, name: true } },
          _count: { select: { chunks: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    );
  if (root === "conversations" && method === "GET")
    return json(
      await db.conversation.findMany({
        where: { bot: { workspaceId: auth.workspace.id } },
        select: {
          id: true,
          createdAt: true,
          preview: true,
          bot: { select: { id: true, name: true } },
          messages: { orderBy: { createdAt: "asc" }, take: 1 },
          _count: { select: { messages: true } },
          usage: {
            select: { inputTokens: true, outputTokens: true, cost: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
    );
  if (root === "playground" && method === "POST") return chat(request, auth);
  if (root !== "bots") throw new HttpError(404, "Endpunkt nicht gefunden.");
  if (!id) {
    if (method === "GET") {
      const bots = await db.bot.findMany({
        where: { workspaceId: auth.workspace.id },
        include: {
          widget: true,
          settings: true,
          domains: true,
          _count: { select: { sources: true, conversations: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      const usage = await db.usageRecord.groupBy({
        by: ["botId"],
        where: {
          bot: { workspaceId: auth.workspace.id },
          preview: false,
          kind: "chat",
        },
        _sum: { inputTokens: true, outputTokens: true, cost: true },
        _count: true,
      });
      return json(
        bots.map((bot) => {
          const u = usage.find((x) => x.botId === bot.id);
          return {
            ...bot,
            stats: {
              messages: (u?._count || 0) * 2,
              tokens: (u?._sum.inputTokens || 0) + (u?._sum.outputTokens || 0),
              cost: u?._sum.cost || 0,
            },
          };
        }),
      );
    }
    if (method === "POST") {
      const data = botSchema.parse(await jsonBody(request));
      const bot = await db.bot.create({
        data: {
          ...data,
          workspaceId: auth.workspace.id,
          settings: { create: {} },
          widget: { create: { displayName: data.name } },
        },
      });
      await audit(auth, "bot.create", bot.id);
      return json(bot, 201);
    }
  }
  const bot = await ownedBot(auth, id);
  if (!action) {
    if (method === "GET") return json(bot);
    if (method === "DELETE") {
      await db.bot.delete({ where: { id } });
      await audit(auth, "bot.delete", id);
      return json({ ok: true });
    }
    if (method === "PATCH") {
      const { settings, widget, domains, ...data } = updateBotSchema.parse(
        await jsonBody(request),
      );
      if (
        settings?.providerId &&
        !(await db.aIProviderCredential.findFirst({
          where: { id: settings.providerId, workspaceId: auth.workspace.id },
        }))
      )
        throw new HttpError(400, "Ungültiger Provider.");
      if (data.active && !(domains || bot.domains).length)
        throw new HttpError(
          400,
          "Vor dem Aktivieren mindestens eine Domain freigeben.",
        );
      await db.$transaction(async (tx) => {
        await tx.bot.update({
          where: { id },
          data: {
            ...data,
            ...(settings ? { settings: { update: settings } } : {}),
            ...(widget ? { widget: { update: widget } } : {}),
            ...(domains
              ? {
                  domains: {
                    deleteMany: {},
                    create: [...new Set(domains)].map((domain) => ({ domain })),
                  },
                }
              : {}),
          },
        });
        if (
          (settings?.embeddingModel && settings.embeddingModel !== bot.settings?.embeddingModel) ||
          (settings?.providerId !== undefined && settings.providerId !== bot.settings?.providerId)
        )
          await tx.knowledgeSource.updateMany({
            where: { botId: id, status: { not: "PROCESSING" } },
            data: { status: "QUEUED" },
          });
        if (settings?.storeConversations === false)
          await tx.conversation.deleteMany({ where: { botId: id } });
        if (settings?.analyticsEnabled === false)
          await tx.usageRecord.deleteMany({ where: { botId: id } });
      });
      await audit(auth, "bot.update", id);
      return json(await ownedBot(auth, id));
    }
  }
  if (action === "duplicate" && method === "POST") {
    const { botId: _settingsBotId, ...settings } = bot.settings!;
    const { botId: _widgetBotId, ...widget } = bot.widget!;
    void _settingsBotId;
    void _widgetBotId;
    const sources = await db.knowledgeSource.findMany({
      where: { botId: id },
      select: { name: true, content: true, type: true, url: true },
    });
    const copy = await db.bot.create({
      data: {
        name: `${bot.name} (Kopie)`.slice(0, 100),
        description: bot.description,
        workspaceId: auth.workspace.id,
        settings: { create: settings },
        widget: { create: widget },
        sources: { create: sources },
      },
    });
    await audit(auth, "bot.duplicate", copy.id);
    return json(copy, 201);
  }
  if (action === "knowledge") {
    if (method === "GET")
      return json(
        await db.knowledgeSource.findMany({
          where: { botId: id },
          select: {
            id: true,
            name: true,
            type: true,
            url: true,
            status: true,
            indexedAt: true,
            error: true,
            _count: { select: { chunks: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      );
    if (method === "POST") {
      await rateLimit(`ingest:${id}`, 30, 3600);
      const data = request.headers
        .get("content-type")
        ?.startsWith("multipart/form-data")
        ? await extractUpload(request)
        : sourceSchema.parse(await jsonBody(request, 600000));
      return json(
        await db.knowledgeSource.create({
          data: { ...data, botId: id },
          select: { id: true, status: true },
        }),
        201,
      );
    }
    if (method === "DELETE" && child) {
      await db.knowledgeSource.deleteMany({ where: { id: child, botId: id } });
      return json({ ok: true });
    }
  }
  if (action === "reindex" && method === "POST") {
    const input = z
      .object({ sourceId: z.string().optional() })
      .parse(await jsonBody(request));
    const result = await db.knowledgeSource.updateMany({
      where: {
        botId: id,
        ...(input.sourceId ? { id: input.sourceId } : {}),
        status: { not: "PROCESSING" },
      },
      data: { status: "QUEUED", error: null },
    });
    return json({ queued: result.count });
  }
  if (action === "analytics" && method === "GET")
    return json(await analytics(auth.workspace.id, url, id));
  if (action === "conversations") {
    if (method === "DELETE") {
      await db.conversation.deleteMany({
        where: { botId: id, ...(child ? { id: child } : {}) },
      });
      await audit(auth, "conversation.delete", id);
      return json({ ok: true });
    }
    if (method === "GET")
      return json(
        await db.conversation.findMany({
          where: { botId: id, ...(child ? { id: child } : {}) },
          select: {
            id: true,
            createdAt: true,
            preview: true,
            messages: { orderBy: { createdAt: "asc" } },
            usage: {
              select: {
                inputTokens: true,
                outputTokens: true,
                cost: true,
                latencyMs: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 100,
        }),
      );
  }
  if (action === "export" && method === "GET") {
    const conversations = await db.conversation.findMany({
      where: { botId: id },
      select: {
        id: true,
        createdAt: true,
        messages: {
          select: {
            role: true,
            content: true,
            createdAt: true,
            feedback: true,
          },
        },
      },
    });
    await audit(auth, "bot.export", id);
    return json(
      { name: bot.name, exportedAt: new Date(), conversations },
      200,
      {
        "Content-Disposition": `attachment; filename="dialogue-${bot.publicId}.json"`,
      },
    );
  }
  throw new HttpError(404, "Endpunkt nicht gefunden.");
}
