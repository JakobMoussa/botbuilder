import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401, json: { error: "Bitte melde dich an." },
  }));
  await page.route("**/api/auth/status", (route) => route.fulfill({
    json: { registrationOpen: true },
  }));
});

test("direct sign-in stays available when registration is open", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Willkommen zurück." })).toBeVisible();
  await expect(page.getByLabel("Dein Name", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Account erstellen", exact: true }).click();
  await expect(page.getByLabel("Dein Name", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Anmelden", exact: true }).click();
  await expect(page.getByLabel("Dein Name", { exact: true })).toHaveCount(0);
  await page.route("**/api/auth/login", (route) => route.fulfill({
    status: 401, json: { error: "E-Mail oder Passwort ist nicht korrekt." },
  }));
  await page.getByLabel("E-Mail-Adresse").fill("unknown@example.test");
  await page.getByLabel("Passwort", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await expect(page.locator(".login-form").getByRole("alert")).toContainText("E-Mail oder Passwort ist nicht korrekt.");
});

test("theme follows system, persists an override and works on mobile", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Hellen Modus aktivieren" })).toBeVisible();
  await expect(page.locator(".login")).toHaveCSS("background-color", "rgb(29, 26, 39)");
  await page.screenshot({ path: "test-results/login-dark-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Hellen Modus aktivieren" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Dunklen Modus aktivieren" }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Hellen Modus aktivieren" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/login-dark-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("dashboard theme and logout return to sign-in", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: {
    user: { name: "Alex Weber", email: "alex@example.test" },
    workspace: { id: "test", name: "Studio Nord" },
  } }));
  await page.route("**/api/bots", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/providers", (route) => route.fulfill({ json: { providers: [] } }));
  await page.route("**/api/analytics?*", (route) => route.fulfill({ json: null }));
  await page.route("**/api/auth/logout", (route) => route.fulfill({ json: { ok: true } }));
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/login");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Hallo, Alex" })).toBeVisible();
  await page.getByRole("button", { name: "Dunklen Modus aktivieren" }).click();
  await expect(page.locator(".sidebar")).toHaveCSS("background-color", "rgb(29, 26, 39)");
  await page.screenshot({ path: "test-results/dashboard-dark-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Chatbot erstellen", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCSS("background-color", "rgb(29, 26, 39)");
  await page.keyboard.press("Escape");
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, json: { error: "Bitte melde dich an." } }));
  await page.getByRole("button", { name: "Abmelden", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Willkommen zurück." })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
