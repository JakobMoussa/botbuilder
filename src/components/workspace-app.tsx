"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot as BotIcon,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  Code2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import {
  APIError,
  api,
  write,
  number,
  money,
  date,
  type Bot,
  type Analytics,
  type Provider,
} from "@/lib/client";
import { Badge, Button, Empty, Field, Modal, Stat } from "./ui";
import { Login } from "./login";
import { ThemeToggle } from "./theme-toggle";
import { BotDetail } from "./bot-detail";
import {
  AnalyticsView,
  ConversationsView,
  KnowledgeView,
  WorkspaceSettings,
} from "./workspace-sections";
type Me = {
  user: { name: string; email: string };
  workspace: { id: string; name: string };
};
const nav = [
  { path: "/dashboard", subpath: "/", label: "Übersicht", icon: LayoutDashboard },
  { path: "/dashboard/bots", subpath: "/bots", label: "Chatbots", icon: BotIcon },
  { path: "/dashboard/knowledge", subpath: "/knowledge", label: "Wissensbasis", icon: BookOpen },
  { path: "/dashboard/conversations", subpath: "/conversations", label: "Konversationen", icon: MessageSquare },
  { path: "/dashboard/analytics", subpath: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
];
export function WorkspaceApp() {
  const router = useRouter(),
    pathname = usePathname() || "/";
  const subpath = pathname.startsWith("/dashboard")
    ? (pathname.replace(/^\/dashboard/, "") || "/")
    : pathname;
  const [me, setMe] = useState<Me | null>(null),
    [checked, setChecked] = useState(false),
    [bots, setBots] = useState<Bot[]>([]),
    [providers, setProviders] = useState<Provider[]>([]),
    [stats, setStats] = useState<Analytics | null>(null);
  const [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [creating, setCreating] = useState(false),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false),
    [workspaceOpen, setWorkspaceOpen] = useState(false),
    [help, setHelp] = useState(false),
    [query, setQuery] = useState("");
  const [workspaces, setWorkspaces] = useState<
    { workspace: { id: string; name: string } }[]
  >([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const notify = useCallback((message: string) => setToast(message), []);
  const refresh = useCallback(async () => {
    try {
      const current = await api<Me>("auth/me");
      setMe(current);
      const [allBots, allProviders, analytics] = await Promise.all([
        api<Bot[]>("bots"),
        api<{ providers: Provider[] }>("providers"),
        api<Analytics>("analytics?days=30"),
      ]);
      setBots(allBots);
      setProviders(allProviders.providers);
      setStats(analytics);
      setError("");
    } catch (e) {
      if (e instanceof APIError && e.status === 401) setMe(null);
      else setError((e as Error).message);
    } finally {
      setChecked(true);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  useEffect(() => {
    if (me && (pathname === "/login" || pathname === "/registrieren" || pathname === "/register")) {
      router.replace("/dashboard");
    }
  }, [me, pathname, router]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const botId = subpath.startsWith("/bots/")
    ? subpath.split("/")[2]
    : undefined;
  const selectedBot = bots.find((x) => x.id === botId);
  const title = botId
    ? "Chatbots"
    : nav.find((x) => x.subpath === subpath)?.label || (subpath === "/settings" ? "Einstellungen" : "Übersicht");
  if (!checked)
    return (
      <div className="boot">
        <span className="brand-mark">
          <Sparkles />
        </span>
        <p>Dein Workspace wird geladen …</p>
      </div>
    );
  if (!me) return <Login key={pathname} mode={pathname === "/login" ? "login" : pathname === "/register" ? "register" : undefined} onLogin={refresh} />;
  const filtered = bots.filter((x) =>
    `${x.name} ${x.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="workspace-layout">
      {mobile && (
        <div className="sidebar-backdrop" onClick={() => setMobile(false)} />
      )}
      <aside className={`sidebar ${mobile ? "visible" : ""}`}>
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">
            <Sparkles size={22} />
          </span>
          dialogue<span className="brand-dot">.</span>
        </Link>
        <button
          className="workspace-switch"
          onClick={async () => {
            setWorkspaceOpen(true);
            try {
              setWorkspaces(await api("workspace"));
            } catch (e) {
              notify((e as Error).message);
            }
          }}
        >
          <span className="workspace-avatar">
            {me.workspace.name.slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{me.workspace.name}</strong>
            <small>Dein Workspace</small>
          </span>
          <ChevronsUpDown size={15} />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => {
                setMobile(false);
                setQuery("");
              }}
              className={
                (
                  item.subpath === "/"
                    ? subpath === "/"
                    : subpath.startsWith(item.subpath)
                )
                  ? "active"
                  : ""
              }
            >
              <item.icon size={19} />
              <span>{item.label}</span>
              {item.subpath === "/bots" && <small>{bots.length}</small>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            className="nav-button"
            href="/"
            title="Zurück zur Website"
            style={{ marginBottom: "12px", border: "1px dashed var(--line)" }}
          >
            <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} /> Zur Website
          </Link>
          <div className="selfhost-card">
            <span>
              <ShieldCheck size={17} /> Dein Server. Deine Daten.
            </span>
            <p>
              Unabhängig gestalten.
              <br />
              Unbegrenzt Möglichkeiten.
            </p>
            <div>
              <i /> Self-hosted Workspace
            </div>
          </div>
          <button className="nav-button" onClick={() => setHelp(true)}>
            <CircleHelp size={18} /> Hilfe & erste Schritte
            <ArrowUpRight size={14} />
          </button>
          <Link
            className={`nav-button ${subpath === "/settings" ? "active" : ""}`}
            href="/dashboard/settings"
          >
            <Settings2 size={18} /> Einstellungen
          </Link>
          <div className="profile">
            <span className="profile-avatar">
              {me.user.name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span>
              <strong>{me.user.name}</strong>
              <small>Workspace Owner</small>
            </span>
            <button
              className="icon-button"
              aria-label="Abmelden"
              title="Abmelden"
              onClick={async () => {
                try {
                  await write("auth/logout", {});
                  setMe(null);
                  setMobile(false);
                  router.replace("/login");
                } catch (e) {
                  notify((e as Error).message);
                }
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-toggle"
              aria-label="Menü öffnen"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{title}</strong>
            {selectedBot && (
              <>
                <ChevronRight size={14} />
                <span>{selectedBot.name}</span>
              </>
            )}
          </div>
          <div className="topbar-right">
            <ThemeToggle />
            <span className="system-status">
              <i /> {error ? "Verbindung prüfen" : "System online"}
            </span>
            <button
              className="icon-button"
              aria-label="Hilfe"
              onClick={() => setHelp(true)}
            >
              <CircleHelp size={19} />
            </button>
            <span className="top-avatar">{me.user.name.slice(0, 1)}</span>
          </div>
        </header>
        <main className="main-content">
          {error && (
            <div className="error-box">
              {error}
              <button className="text-button" onClick={refresh}>
                Erneut versuchen
              </button>
            </div>
          )}
          {selectedBot ? (
            <BotDetail
              key={selectedBot.id}
              bot={selectedBot}
              providers={providers}
              onRefresh={refresh}
              notify={notify}
            />
          ) : botId ? (
            <Empty
              title="Chatbot nicht gefunden"
              description="Dieser Chatbot ist in deinem Workspace nicht verfügbar."
            />
          ) : subpath === "/settings" ? (
            <WorkspaceSettings
              me={me}
              providers={providers}
              onRefresh={refresh}
              notify={notify}
            />
          ) : subpath === "/knowledge" ? (
            <KnowledgeView bots={bots} notify={notify} />
          ) : subpath === "/conversations" ? (
            <ConversationsView bots={bots} notify={notify} />
          ) : subpath === "/analytics" ? (
            <AnalyticsView />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">DEIN AI WORKSPACE</div>
                  <h1>
                    {subpath === "/bots"
                      ? "Deine Chatbots"
                      : `Hallo, ${me.user.name.split(" ")[0]} 👋`}
                  </h1>
                  <p>
                    {subpath === "/bots"
                      ? "Ein Assistent für jede Website. Alles an einem Ort."
                      : "Ein guter Tag, um aus Fragen gute Gespräche zu machen."}
                  </p>
                </div>
                <Button onClick={() => setCreating(true)}>
                  <Plus size={18} /> Chatbot erstellen
                </Button>
              </div>
              {subpath === "/" && (
                <>
                  <div className="welcome-banner">
                    <div>
                      <span className="mini-label">
                        <Sparkles size={14} /> WISSEN, DAS WEITERHILFT
                      </span>
                      <h2>
                        Deine Website hat jetzt
                        <br />
                        jemanden, der zuhört.
                      </h2>
                      <p>
                        Verbinde dein Wissen. Gestalte deinen Assistenten.
                        <br />
                        Und sei für deine Besucher da – rund um die Uhr.
                      </p>
                      <button
                        onClick={() =>
                          bots.length
                            ? router.push(`/dashboard/bots/${bots[0].id}`)
                            : setCreating(true)
                        }
                      >
                        Deinen Assistenten gestalten <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="banner-art" aria-hidden="true">
                      <div className="art-ring ring-a" />
                      <div className="art-ring ring-b" />
                      <span className="art-star star-a">✦</span>
                      <span className="art-star star-b">✧</span>
                      <div className="art-chat chat-a">
                        <span className="art-chat-icon">
                          <MessageSquare size={18} />
                        </span>
                        <div>
                          <i />
                          <i />
                        </div>
                      </div>
                      <div className="art-bot">
                        <BotIcon size={54} strokeWidth={1.3} />
                        <span className="art-dot" />
                      </div>
                      <div className="art-chat chat-b">
                        <Sparkles size={18} />
                        <span>Eine gute Frage. Eine gute Antwort.</span>
                        <Check size={15} />
                      </div>
                    </div>
                  </div>
                  <div className="stat-grid">
                    <Stat
                      label="Aktive Chatbots"
                      value={String(
                        bots.filter((x) => x.active).length,
                      ).padStart(2, "0")}
                      icon={<BotIcon size={18} />}
                      note={`${bots.length} Chatbots im Workspace`}
                    />
                    <Stat
                      label="Konversationen"
                      value={number(stats?.conversations || 0)}
                      icon={<MessageSquare size={18} />}
                      note="In den letzten 30 Tagen"
                    />
                    <Stat
                      label="Nachrichten"
                      value={number(stats?.messages || 0)}
                      icon={<Zap size={18} />}
                      note="In den letzten 30 Tagen"
                    />
                    <Stat
                      label="Geschätzte API-Kosten"
                      value={money(stats?.cost || 0)}
                      icon={<ChartNoAxesCombined size={18} />}
                      note={`${number(stats?.tokens || 0)} Tokens · 30 Tage`}
                    />
                  </div>
                </>
              )}
              <section className="bots-section">
                <div className="section-heading">
                  <div>
                    <h2>
                      Deine Chatbots{" "}
                      <span className="count-pill">{bots.length}</span>
                    </h2>
                    <p>
                      Deine digitalen Assistenten, bereit für den nächsten
                      Dialog.
                    </p>
                  </div>
                  {subpath === "/" && (
                    <Link className="text-link" href="/dashboard/bots">
                      Alle anzeigen <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
                <div className="list-toolbar">
                  <div className="tabs compact">
                    <button className="selected" onClick={() => setQuery("")}>
                      Alle Chatbots <span>{bots.length}</span>
                    </button>
                  </div>
                  <div className="search-field">
                    <Search size={16} />
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Chatbots durchsuchen …"
                      aria-label="Chatbots durchsuchen"
                    />
                    <kbd>⌘ K</kbd>
                  </div>
                </div>
                {bots.length === 0 ? (
                  <div className="first-bot">
                    <div className="first-bot-visual">
                      <div className="empty-bot">
                        <BotIcon size={37} strokeWidth={1.4} />
                      </div>
                      <span className="tiny-bubble">Hallo! 👋</span>
                    </div>
                    <h3>Dein erster Dialog beginnt hier.</h3>
                    <p>
                      Erstelle einen Chatbot, gib ihm dein Wissen und
                      <br />
                      mach deine Website ein Stück persönlicher.
                    </p>
                    <Button onClick={() => setCreating(true)}>
                      <Plus size={16} /> Ersten Chatbot erstellen
                    </Button>
                    <span className="subtle">
                      In wenigen Schritten bereit für deine Website
                    </span>
                  </div>
                ) : !filtered.length ? (
                  <Empty
                    title="Kein Treffer"
                    description="Versuche einen anderen Namen oder Suchbegriff."
                  />
                ) : (
                  <div className="bot-grid">
                    {filtered.map((bot, index) => (
                      <Link
                        href={`/dashboard/bots/${bot.id}`}
                        className="bot-card"
                        key={bot.id}
                      >
                        <div className="bot-card-head">
                          <span
                            className={`bot-avatar color-${index % 4}`}
                            style={{
                              background: bot.widget.primaryColor + "16",
                              color: bot.widget.primaryColor,
                            }}
                          >
                            <BotIcon size={27} strokeWidth={1.6} />
                          </span>
                          <Badge active={bot.active} />
                        </div>
                        <h3>{bot.name}</h3>
                        <p>
                          {bot.description ||
                            "Dein persönlicher Website-Assistent."}
                        </p>
                        <div className="bot-domain">
                          <span>
                            <i />
                            {bot.domains[0]?.domain ||
                              "Noch keine Domain verbunden"}
                          </span>
                        </div>
                        <div className="bot-card-stats">
                          <div>
                            <strong>{number(bot._count.conversations)}</strong>
                            <span>Gespräche</span>
                          </div>
                          <div>
                            <strong>{number(bot.stats?.messages || 0)}</strong>
                            <span>Nachrichten</span>
                          </div>
                          <div>
                            <strong>{bot._count.sources}</strong>
                            <span>Quellen</span>
                          </div>
                        </div>
                        <div className="bot-card-footer">
                          <span>{date(bot.lastActivity)}</span>
                          <ArrowUpRight size={17} />
                        </div>
                      </Link>
                    ))}
                    <button
                      className="new-bot-card"
                      onClick={() => setCreating(true)}
                    >
                      <span>
                        <Plus size={23} />
                      </span>
                      <strong>Platz für deinen nächsten Bot</strong>
                      <small>Eine neue Website. Ein neuer Dialog.</small>
                    </button>
                  </div>
                )}
              </section>
              {subpath === "/" && (
                <div className="bottom-grid">
                  <section className="panel getting-started">
                    <div className="section-heading">
                      <h2>In drei Schritten live</h2>
                      <span className="count-pill">
                        {
                          [
                            bots.length > 0,
                            bots.some((x) => x._count.sources > 0),
                            bots.some((x) => x.active),
                          ].filter(Boolean).length
                        }{" "}
                        / 3
                      </span>
                    </div>
                    {[
                      {
                        title: "Gib deinem Assistenten eine Identität",
                        text: "Name, Persönlichkeit und den richtigen Ton.",
                        icon: BotIcon,
                        complete: bots.length > 0,
                        action: () =>
                          bots.length
                            ? router.push(`/dashboard/bots/${bots[0].id}`)
                            : setCreating(true),
                      },
                      {
                        title: "Mach dein Wissen zugänglich",
                        text: "Webseiten, Dokumente und Antworten verbinden.",
                        icon: BookOpen,
                        complete: bots.some((x) => x._count.sources > 0),
                        action: () => router.push("/dashboard/knowledge"),
                      },
                      {
                        title: "Bring den Dialog auf deine Website",
                        text: "Ein kleines Snippet. Viele gute Gespräche.",
                        icon: Code2,
                        complete: bots.some((x) => x.active),
                        action: () =>
                          bots.length
                            ? router.push(`/dashboard/bots/${bots[0].id}?tab=embed`)
                            : setCreating(true),
                      },
                    ].map((step, i) => (
                      <button
                        className="setup-step"
                        key={step.title}
                        onClick={step.action}
                      >
                        <span
                          className={
                            step.complete ? "step-icon complete" : "step-icon"
                          }
                        >
                          {step.complete ? (
                            <Check size={17} />
                          ) : (
                            <step.icon size={17} />
                          )}
                        </span>
                        <div>
                          <strong>{step.title}</strong>
                          <small>{step.text}</small>
                        </div>
                        <span className="step-number">0{i + 1}</span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </section>
                  <section className="privacy-panel">
                    <span className="privacy-symbol">
                      <ShieldCheck size={29} strokeWidth={1.5} />
                    </span>
                    <span className="eyebrow">VOLLE KONTROLLE</span>
                    <h2>
                      Dein Wissen verdient
                      <br />
                      ein eigenes Zuhause.
                    </h2>
                    <p>
                      Eigene API-Keys, getrennte Wissensbasen und
                      konfigurierbare Datenspeicherung. Du entscheidest.
                    </p>
                    <Link href="/dashboard/settings">
                      Workspace konfigurieren <ArrowUpRight size={16} />
                    </Link>
                  </section>
                </div>
              )}
              <footer className="content-footer">
                <span>Mit Wissen gemacht. Für Menschen gedacht.</span>
                <span>
                  dialogue <span className="brand-dot">✦</span>
                </span>
              </footer>
            </>
          )}
        </main>
      </div>
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Ein neuer Assistent."
        description="Gib deinem Chatbot einen Namen. Alles Weitere kannst du danach in Ruhe gestalten."
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const data = Object.fromEntries(new FormData(e.currentTarget));
            try {
              const bot = await write<Bot>("bots", data);
              await refresh();
              setCreating(false);
              notify("Dein Chatbot wurde erstellt.");
              router.push(`/dashboard/bots/${bot.id}`);
            } catch (e) {
              notify((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Name des Chatbots">
            <input
              name="name"
              autoFocus
              required
              minLength={2}
              maxLength={100}
              placeholder="z. B. Studio Assistent"
            />
          </Field>
          <Field label="Interne Beschreibung">
            <textarea
              name="description"
              maxLength={500}
              placeholder="Für welche Website ist dieser Assistent da?"
              rows={3}
            />
          </Field>
          <div className="info-box">
            <ShieldCheck size={18} />
            <span>
              Dein Bot startet als Entwurf. Du entscheidest, wann er live geht.
            </span>
          </div>
          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreating(false)}
            >
              Abbrechen
            </Button>
            <Button busy={busy} type="submit">
              Chatbot erstellen
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        title="Deine Workspaces"
      >
        <div className="workspace-options">
          {workspaces.map((x) => (
            <button
              key={x.workspace.id}
              onClick={async () => {
                await write("workspace", { id: x.workspace.id }, "PUT");
                setWorkspaceOpen(false);
                router.push("/dashboard");
                await refresh();
              }}
            >
              <span>{x.workspace.name}</span>
              {x.workspace.id === me.workspace.id ? (
                <Check size={17} />
              ) : (
                <ArrowRight size={17} />
              )}
            </button>
          ))}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const name = new FormData(e.currentTarget).get("name");
            try {
              await write("workspace", { name });
              setWorkspaceOpen(false);
              router.push("/dashboard");
              await refresh();
            } catch (e) {
              notify((e as Error).message);
            }
          }}
        >
          <Field label="Neuen Workspace erstellen">
            <input
              name="name"
              placeholder="Name des Workspaces"
              required
              minLength={2}
            />
          </Field>
          <Button type="submit">
            <Plus size={16} /> Workspace erstellen
          </Button>
        </form>
      </Modal>
      <Modal
        open={help}
        onClose={() => setHelp(false)}
        title="Von Wissen zu guten Antworten."
        description="So bringst du deinen ersten Assistenten live."
      >
        <ol className="help-list">
          <li>
            <strong>Provider verbinden</strong>
            <p>
              Hinterlege deinen API-Key unter Einstellungen und wähle den
              Provider im Playground.
            </p>
          </li>
          <li>
            <strong>Wissen hinzufügen</strong>
            <p>
              Lade Dokumente hoch, ergänze FAQs oder importiere eine Website.
              Warte, bis der Status „Bereit“ erscheint.
            </p>
          </li>
          <li>
            <strong>Testen und veröffentlichen</strong>
            <p>
              Teste Antworten im Playground, gib deine Website-Domain frei,
              aktiviere den Bot und kopiere das Embed-Snippet.
            </p>
          </li>
        </ol>
        <Button
          className="full"
          onClick={() => {
            setHelp(false);
            router.push("/dashboard/settings");
          }}
        >
          Zu den Einstellungen <ArrowRight size={16} />
        </Button>
      </Modal>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={17} />
          </span>
          {toast}
          <button aria-label="Meldung schließen" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
