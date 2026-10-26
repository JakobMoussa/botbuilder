import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { createServer, type Server } from "node:http";
import { randomUUID, scryptSync } from "node:crypto";
const db = new PrismaClient();
let userId: string, workspaceId: string, server: Server;
let firstRun = false;
const email = `browser-${randomUUID()}@example.test`;
const password = randomUUID() + "-test-password";
test.beforeAll(async () => {
  firstRun = (await db.user.count()) === 0;
  if (!firstRun) {
  const salt = randomUUID();
  const user = await db.user.create({
    data: {
      name: "Alex Weber",
      email,
      passwordHash: salt + ":" + scryptSync(password, salt, 64).toString("hex"),
    },
  });
  userId = user.id;
  const workspace = await db.workspace.create({
    data: { name: "Studio Nord", members: { create: { userId } } },
  });
  workspaceId = workspace.id;
  }
  server = createServer(async (_request, response) => {
    const bot = await db.bot.findFirst({ where: { workspaceId } });
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(
      `<html><body><h1>Widget test website</h1><script src="http://localhost:3000/chatbot.js" data-bot-id="${bot?.publicId}" async></script></body></html>`,
    );
  });
  await new Promise<void>((resolve) =>
    server.listen(3002, "127.0.0.1", resolve),
  );
});
test.afterAll(async () => {
  if (workspaceId)
    await db.workspace.deleteMany({ where: { id: workspaceId } });
  if (userId) await db.user.deleteMany({ where: { id: userId } });
  await db.$disconnect();
  await new Promise<void>((resolve) => server?.close(() => resolve()));
});
test("login, bot CRUD, design, domains, knowledge, analytics and cross-origin widget", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  if (firstRun) {
    await page.getByLabel("Dein Name", { exact: true }).fill("Alex Weber");
    await page.getByLabel("Workspace", { exact: true }).fill("Studio Nord");
  }
  await page.getByLabel("E-Mail-Adresse").fill(email);
  await page.getByLabel("Passwort", { exact: true }).fill(password);
  await page.getByRole("button", { name: firstRun ? "Workspace erstellen" : "Anmelden", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hallo, Alex" }),
  ).toBeVisible();
  if (firstRun) {
    const user = await db.user.findUniqueOrThrow({ where: { email }, include: { memberships: true } });
    userId = user.id;
    workspaceId = user.memberships[0].workspaceId;
    await page.getByRole("button", { name: "Abmelden", exact: true }).click();
    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Anmelden", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Hallo, Alex" })).toBeVisible();
  }
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Chatbot erstellen", exact: true })
    .click();
  await page.getByLabel("Name des Chatbots").fill("Studio Assistent");
  await page
    .getByLabel("Interne Beschreibung")
    .fill("Persönliche Antworten für die Website von Studio Nord.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Chatbot erstellen" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Studio Assistent" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await page.getByLabel("Angezeigter Name").fill("Nord Assistent");
  await page
    .getByLabel("Begrüßung", { exact: true })
    .fill("Moin! Wie können wir dir helfen?");
  await page.getByRole("button", { name: "Design speichern" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Änderungen gespeichert",
  );
  await page.screenshot({
    path: "test-results/appearance-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Einbinden", exact: true }).click();
  await page.getByLabel("Erlaubte Domains").fill("127.0.0.1:3002");
  await page.getByRole("button", { name: "Domains speichern" }).click();
  await expect
    .poll(
      async () =>
        await db.allowedDomain.count({ where: { bot: { workspaceId } } }),
    )
    .toBe(1);
  await page.getByRole("button", { name: "Bot aktivieren" }).click();
  await expect(
    page.getByRole("button", { name: "Aktiv · Pausieren" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Wissensbasis", exact: true }).click();
  await page.getByRole("button", { name: "Quelle hinzufügen" }).click();
  await page.getByLabel("Name der Quelle").fill("Unsere Leistungen");
  await page
    .getByLabel("Wissen als Text")
    .fill("Studio Nord gestaltet Websites und Marken für kleine Unternehmen.");
  await page.getByRole("button", { name: "Hinzufügen & indexieren" }).click();
  await expect(
    page.getByText("Unsere Leistungen", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Analytics", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Einblicke, die weiterhelfen." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Playground", exact: true }).click();
  await expect(
    page.getByText("Moin! Wie können wir dir helfen?", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Alle Chatbots", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Deine Chatbots", exact: true }).first(),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hallo, Alex" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await expect(
    page.getByRole("link", { name: "Einstellungen", exact: true }),
  ).toBeVisible();
  await page.goto("http://127.0.0.1:3002");
  await page.getByRole("button", { name: "Chat öffnen", exact: true }).click();
  await expect(
    page.getByText("Moin! Wie können wir dir helfen?", { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Deine Nachricht" }).fill("Hallo!");
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(page.getByRole("alert")).toContainText("Provider");
  await page.screenshot({
    path: "test-results/widget-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
