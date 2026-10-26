"use client";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Globe2,
  KeyRound,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  Users,
  Zap,
  Cloud,
  Database,
  HardDrive,
} from "lucide-react";
import {
  api,
  date,
  money,
  number,
  write,
  type Analytics,
  type Bot,
  type Conversation,
  type Provider,
  type Source,
} from "@/lib/client";
import { Badge, Button, Empty, Field, Modal, Skeleton, Stat } from "./ui";
type Notice = { notify: (text: string) => void };
export function KnowledgeView({
  bot,
  bots,
  notify,
}: { bot?: Bot; bots: Bot[] } & Notice) {
  const [sources, setSources] = useState<Source[]>([]),
    [loading, setLoading] = useState(true),
    [open, setOpen] = useState(false),
    [type, setType] = useState("TEXT"),
    [busy, setBusy] = useState(false),
    [targetBot, setTargetBot] = useState(bot?.id || bots[0]?.id || ""),
    [query, setQuery] = useState(""),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      setSources(await api(bot ? `bots/${bot.id}/knowledge` : "knowledge"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [bot]);
  useEffect(() => {
    void Promise.resolve().then(refresh);
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);
  async function add(form: HTMLFormElement) {
    setBusy(true);
    const data = new FormData(form);
    try {
      if (type === "FILE") {
        const upload = new FormData();
        upload.set("file", data.get("file")!);
        await api(`bots/${targetBot}/knowledge`, {
          method: "POST",
          body: upload,
        });
      } else {
        const body = {
          name: data.get("name"),
          type,
          ...(["URL", "CRAWL"].includes(type)
            ? { url: data.get("url") }
            : {
                content:
                  type === "FAQ"
                    ? `Frage: ${data.get("question")}\nAntwort: ${data.get("answer")}`
                    : data.get("content"),
              }),
        };
        await write(`bots/${targetBot}/knowledge`, body);
      }
      setOpen(false);
      await refresh();
      notify("Quelle hinzugefügt. Die Indexierung startet automatisch.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading section-page-heading">
        <div>
          {!bot && <span className="eyebrow">DEIN WISSEN VERBINDET</span>}
          <h1>Wissensbasis</h1>
          <p>Gute Antworten beginnen mit dem richtigen Wissen.</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!bots.length}>
          <Plus size={17} /> Quelle hinzufügen
        </Button>
      </div>
      <div className="info-banner">
        <span>
          <BookOpen size={23} />
        </span>
        <div>
          <strong>Dein Wissen. Immer im richtigen Kontext.</strong>
          <p>
            Deine Inhalte werden in durchsuchbare Abschnitte aufgeteilt. Jeder
            Bot greift ausschließlich auf seine eigenen Quellen zu.
          </p>
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <Skeleton />
      ) : !sources.length ? (
        <section className="panel">
          <Empty
            title="Hier beginnt das Wissen deines Bots."
            description={
              bots.length
                ? "Verbinde eine Website, lade Dokumente hoch oder ergänze die Antworten auf häufige Fragen."
                : "Erstelle zuerst einen Chatbot, um ihm Wissen hinzuzufügen."
            }
          >
            {bots.length > 0 && (
              <Button onClick={() => setOpen(true)}>
                <Plus size={16} /> Erste Quelle hinzufügen
              </Button>
            )}
          </Empty>
        </section>
      ) : (
        <section className="panel table-panel">
          <div className="table-toolbar">
            <h3>{sources.length} Wissensquellen</h3>
            <div className="search-field">
              <Search size={15} />
              <input
                aria-label="Quellen durchsuchen"
                placeholder="Quellen durchsuchen …"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Quelle</th>
                  {!bot && <th>Chatbot</th>}
                  <th>Status</th>
                  <th>Chunks</th>
                  <th>Indexiert</th>
                  <th aria-label="Aktionen" />
                </tr>
              </thead>
              <tbody>
                {sources
                  .filter((s) =>
                    s.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((source) => (
                    <tr key={source.id}>
                      <td>
                        <div className="source-name">
                          <span className="file-icon">
                            {["URL", "CRAWL"].includes(source.type) ? (
                              <Globe2 size={18} />
                            ) : (
                              <FileText size={18} />
                            )}
                          </span>
                          <div>
                            <strong>{source.name}</strong>
                            <small>{source.type}</small>
                            {source.error && (
                              <small className="text-error">
                                {source.error}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      {!bot && <td>{source.bot?.name}</td>}
                      <td>
                        <span
                          className={`source-status status-${source.status.toLowerCase()}`}
                        >
                          {["QUEUED", "PROCESSING"].includes(source.status) && (
                            <Loader2 className="spin" size={12} />
                          )}
                          {
                            (
                              {
                                READY: "Bereit",
                                ERROR: "Fehler",
                                QUEUED: "Warteschlange",
                                PROCESSING: "Indexiert …",
                              } as Record<string, string>
                            )[source.status]
                          }
                        </span>
                      </td>
                      <td>{source._count.chunks}</td>
                      <td>{date(source.indexedAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            title="Neu indexieren"
                            aria-label={`${source.name} neu indexieren`}
                            disabled={source.status === "PROCESSING"}
                            onClick={async () => {
                              try {
                                await write(
                                  `bots/${bot?.id || source.bot?.id}/reindex`,
                                  { sourceId: source.id },
                                );
                                await refresh();
                                notify("Neuindexierung eingeplant.");
                              } catch (e) {
                                notify((e as Error).message);
                              }
                            }}
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button
                            className="icon-button delete"
                            aria-label={`${source.name} löschen`}
                            onClick={async () => {
                              try {
                                await api(
                                  `bots/${bot?.id || source.bot?.id}/knowledge/${source.id}`,
                                  { method: "DELETE" },
                                );
                                await refresh();
                                notify("Quelle gelöscht.");
                              } catch (e) {
                                notify((e as Error).message);
                              }
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Wissen hinzufügen"
        description="Verbinde die Informationen, die dein Assistent kennen soll."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void add(e.currentTarget);
          }}
        >
          {!bot && (
            <Field label="Chatbot">
              <select
                required
                value={targetBot}
                onChange={(e) => setTargetBot(e.target.value)}
              >
                {bots.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="source-types">
            {[
              ["TEXT", "Text"],
              ["FAQ", "FAQ"],
              ["URL", "Webseite"],
              ["CRAWL", "Crawler"],
              ["FILE", "Datei"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={type === value ? "selected" : ""}
                onClick={() => setType(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {type !== "FILE" && (
            <Field label="Name der Quelle">
              <input
                name="name"
                required
                maxLength={200}
                placeholder="z. B. Leistungen & Preise"
              />
            </Field>
          )}
          {["URL", "CRAWL"].includes(type) ? (
            <Field
              label="Website-URL"
              hint={
                type === "CRAWL"
                  ? "Bis zu 20 Seiten derselben Domain. robots.txt wird berücksichtigt."
                  : "Importiert den Text dieser einzelnen Seite."
              }
            >
              <input
                type="url"
                name="url"
                required
                placeholder="https://example.com"
              />
            </Field>
          ) : type === "FILE" ? (
            <label className="upload-zone">
              <Upload size={28} />
              <strong>Wissen zum Mitnehmen.</strong>
              <span>TXT, Markdown, PDF oder DOCX · maximal 5 MB</span>
              <input
                type="file"
                name="file"
                required
                accept=".txt,.md,.markdown,.pdf,.docx"
              />
            </label>
          ) : type === "FAQ" ? (
            <>
              <Field label="Frage">
                <input
                  name="question"
                  required
                  placeholder="Wie sind eure Öffnungszeiten?"
                />
              </Field>
              <Field label="Antwort">
                <textarea name="answer" rows={5} required />
              </Field>
            </>
          ) : (
            <Field label="Wissen als Text">
              <textarea
                name="content"
                rows={8}
                required
                maxLength={500000}
                placeholder="Alles, was dein Assistent wissen soll …"
              />
            </Field>
          )}
          <div className="modal-actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button busy={busy} type="submit">
              <Plus size={16} /> Hinzufügen & indexieren
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
export function ConversationsView({
  bot,
  bots: _bots,
  notify,
}: { bot?: Bot; bots: Bot[] } & Notice) {
  void _bots;
  const [items, setItems] = useState<Conversation[]>([]),
    [selected, setSelected] = useState<Conversation | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [confirm, setConfirm] = useState(false);
  const refresh = useCallback(async () => {
    try {
      setItems(
        await api(bot ? `bots/${bot.id}/conversations` : "conversations"),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [bot]);
  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  async function select(conversation: Conversation) {
    try {
      const full = await api<Conversation[]>(
        `bots/${bot?.id || conversation.bot?.id}/conversations/${conversation.id}`,
      );
      setSelected({ ...full[0], bot: conversation.bot });
    } catch (e) {
      notify((e as Error).message);
    }
  }
  return (
    <>
      <div className="page-heading section-page-heading">
        <div>
          {!bot && (
            <span className="eyebrow">ZUHÖREN. VERSTEHEN. VERBESSERN.</span>
          )}
          <h1>Konversationen</h1>
          <p>
            Die Fragen deiner Besucher und die Antworten deines Assistenten.
          </p>
        </div>
        {bot && (
          <a
            className="button secondary"
            href={`/api/bots/${bot.id}/export`}
            download
          >
            <Download size={16} /> Exportieren
          </a>
        )}
      </div>
      {error && <div className="error-box">{error}</div>}
      {loading ? (
        <Skeleton />
      ) : !items.length ? (
        <section className="panel">
          <Empty
            title="Noch ist es ganz ruhig hier."
            description="Sobald dein Assistent Gespräche führt und die Speicherung aktiviert ist, erscheinen sie hier."
          />
        </section>
      ) : (
        <div className="conversation-layout">
          <section className="panel conversation-list">
            <div className="search-field">
              <Search size={16} />
              <input
                aria-label="Gespräche durchsuchen"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Gespräche durchsuchen …"
              />
            </div>
            {items
              .filter(
                (x) =>
                  x.messages[0]?.content
                    .toLowerCase()
                    .includes(query.toLowerCase()) || x.id.includes(query),
              )
              .map((item) => (
                <button
                  className={`conversation-item ${selected?.id === item.id ? "selected" : ""}`}
                  key={item.id}
                  onClick={() => select(item)}
                >
                  <span className="conversation-item-icon">
                    <MessageSquare size={17} />
                  </span>
                  <div>
                    <strong>
                      {item.messages[0]?.content || "Neue Unterhaltung"}
                    </strong>
                    <small>
                      {item.bot?.name ||
                        (item.preview ? "Playground" : "Website")}{" "}
                      · {date(item.createdAt)}
                    </small>
                    <span>
                      {item._count?.messages || item.messages.length}{" "}
                      Nachrichten {item.preview && "· Test"}
                    </span>
                  </div>
                  <ChevronRight size={15} />
                </button>
              ))}
          </section>
          <section className="panel conversation-detail">
            {selected ? (
              <>
                <div className="conversation-detail-head">
                  <div>
                    <h3>
                      {selected.preview
                        ? "Playground-Gespräch"
                        : "Website-Gespräch"}
                    </h3>
                    <small>
                      Session {selected.id.slice(0, 8)} ·{" "}
                      {date(selected.createdAt)}
                    </small>
                  </div>
                  <button
                    className="icon-button delete"
                    aria-label="Unterhaltung löschen"
                    onClick={() => setConfirm(true)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="conversation-meta">
                  <span>
                    <Zap size={14} />{" "}
                    {number(
                      selected.usage.reduce(
                        (n, u) => n + u.inputTokens + u.outputTokens,
                        0,
                      ),
                    )}{" "}
                    Tokens
                  </span>
                  <span>
                    {money(selected.usage.reduce((n, u) => n + u.cost, 0))}{" "}
                    geschätzt
                  </span>
                </div>
                <div className="saved-messages">
                  {selected.messages.map((message) => (
                    <article
                      className={`saved-message ${message.role}`}
                      key={message.id}
                    >
                      <small>
                        {message.role === "user" ? "Besucher" : "Assistent"}
                      </small>
                      <p>{message.content}</p>
                      <time>
                        {new Date(message.createdAt).toLocaleTimeString(
                          "de-DE",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </time>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <Empty
                title="Ein Gespräch, viele Einblicke."
                description="Wähle links eine Unterhaltung aus, um den vollständigen Verlauf zu lesen."
              />
            )}
          </section>
        </div>
      )}
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Unterhaltung löschen?"
        description="Nachrichten und zugehörige Verbrauchsdaten werden dauerhaft entfernt."
      >
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Abbrechen
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!selected) return;
              try {
                await api(
                  `bots/${bot?.id || selected.bot?.id}/conversations/${selected.id}`,
                  { method: "DELETE" },
                );
                setSelected(null);
                setConfirm(false);
                await refresh();
                notify("Unterhaltung gelöscht.");
              } catch (e) {
                notify((e as Error).message);
              }
            }}
          >
            Löschen
          </Button>
        </div>
      </Modal>
    </>
  );
}
export function AnalyticsView({ bot }: { bot?: Bot }) {
  const [data, setData] = useState<Analytics | null>(null),
    [days, setDays] = useState("30"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (days === "custom" && (!from || !to)) return;
    let cancelled = false;
    api<Analytics>(
      `${bot ? `bots/${bot.id}/` : ""}analytics?${days === "custom" ? `from=${from}&to=${to}` : `days=${days}`}`,
    )
      .then((x) => {
        if (!cancelled) {
          setData(x);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [bot, days, from, to]);
  const max = Math.max(...(data?.series.map((x) => x.messages) || [0]), 1);
  const positive = data?.feedback.find((x) => x.feedback === 1)?._count || 0,
    negative = data?.feedback.find((x) => x.feedback === -1)?._count || 0;
  return (
    <>
      <div className="page-heading section-page-heading">
        <div>
          <span className="eyebrow">AUS GESPRÄCHEN LERNEN</span>
          <h1>Einblicke, die weiterhelfen.</h1>
          <p>
            Verstehe, wie dein Assistent genutzt wird – und wo er noch besser
            werden kann.
          </p>
        </div>
        <select
          className="period-select"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          aria-label="Zeitraum"
        >
          <option value="1">Letzte 24 Stunden</option>
          <option value="7">Letzte 7 Tage</option>
          <option value="30">Letzte 30 Tage</option>
          <option value="90">Letzte 90 Tage</option>
          <option value="custom">Eigener Zeitraum</option>
        </select>
      </div>
      {days === "custom" && (
        <div className="form-row custom-dates">
          <Field label="Von">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label="Bis">
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
        </div>
      )}
      {error && <div className="error-box">{error}</div>}
      {!data ? (
        <Skeleton />
      ) : (
        <>
          <div className="stat-grid">
            <Stat
              label="Konversationen"
              value={number(data.conversations)}
              icon={<MessageSquare size={18} />}
            />
            <Stat
              label="Nachrichten"
              value={number(data.messages)}
              icon={<Zap size={18} />}
            />
            <Stat
              label="Eindeutige Sessions"
              value={number(data.uniqueSessions)}
              icon={<Users size={18} />}
            />
            <Stat
              label="Geschätzte Kosten"
              value={money(data.cost)}
              icon={<ChartNoAxesCombined size={18} />}
              note={`${number(data.tokens)} Tokens`}
            />
          </div>
          <section className="panel chart-panel">
            <div className="section-heading">
              <div>
                <h2>Jeder Dialog zählt.</h2>
                <p>Nachrichten pro Tag</p>
              </div>
              <span className="chart-legend">
                <i /> Nachrichten
              </span>
            </div>
            {data.series.length ? (
              <div
                className="bar-chart"
                role="img"
                aria-label="Nachrichten pro Tag"
              >
                <div className="chart-bars">
                  {data.series.map((point) => (
                    <div
                      className="bar-column"
                      key={point.date}
                      title={`${point.date}: ${point.messages} Nachrichten`}
                    >
                      <span>{point.messages}</span>
                      <div
                        style={{
                          height: `${Math.max((point.messages / max) * 190, 3)}px`,
                        }}
                      />
                      <small>
                        {new Date(point.date).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty
                title="Die ersten Einblicke kommen mit den ersten Gesprächen."
                description="In diesem Zeitraum wurden noch keine Live-Anfragen erfasst."
              />
            )}
          </section>
          <div className="analytics-secondary">
            <section className="panel mini-stat">
              <Clock3 size={22} />
              <div>
                <span>Ø Antwortzeit</span>
                <strong>{(data.latencyMs / 1000).toFixed(1)} s</strong>
              </div>
            </section>
            <section className="panel mini-stat">
              <ThumbsUp size={22} />
              <div>
                <span>Positives Feedback</span>
                <strong>{positive}</strong>
              </div>
            </section>
            <section className="panel mini-stat">
              <ThumbsDown size={22} />
              <div>
                <span>Negatives Feedback</span>
                <strong>{negative}</strong>
              </div>
            </section>
          </div>
          <div className="bottom-grid">
            <section className="panel question-panel">
              <h2>Was deine Besucher beschäftigt</h2>
              <p>Häufigste Fragen im ausgewählten Zeitraum</p>
              {data.questions.length ? (
                data.questions.map((q, i) => (
                  <div className="question-row" key={i}>
                    <span>{i + 1}</span>
                    <p>{q.content}</p>
                    <strong>{q.count}×</strong>
                  </div>
                ))
              ) : (
                <p className="small-empty">
                  Noch keine gespeicherten Fragen vorhanden.
                </p>
              )}
            </section>
            <section className="panel question-panel">
              <h2>Hier darf dein Wissen wachsen</h2>
              <p>Fragen aus Gesprächen ohne ausreichende Wissenstreffer</p>
              {data.weakQuestions.length ? (
                data.weakQuestions.map((q, i) => (
                  <div className="question-row" key={i}>
                    <BookOpen size={16} />
                    <p>{q.content}</p>
                  </div>
                ))
              ) : (
                <p className="small-empty">
                  Keine Wissenslücken in diesem Zeitraum erfasst.
                </p>
              )}
            </section>
          </div>
          <p className="field-hint">
            Tests im Playground sind ausgeschlossen. Kosten basieren auf den
            hinterlegten Preisen. Sessions und Fragen stehen nur bei aktivierter
            Gesprächsspeicherung zur Verfügung.
          </p>
        </>
      )}
    </>
  );
}
export function WorkspaceSettings({
  me,
  providers,
  onRefresh,
  notify,
}: {
  me: { workspace: { name: string }; user: { name: string; email: string } };
  providers: Provider[];
  onRefresh: () => Promise<void>;
} & Notice) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [backupBusy, setBackupBusy] = useState(false),
    [name, setName] = useState(me.workspace.name),
    [backups, setBackups] = useState<
      {
        id: string;
        label: string;
        createdAt: string;
        stats: {
          botsCount: number;
          sourcesCount: number;
          chunksCount: number;
          conversationsCount: number;
          messagesCount: number;
          providersCount: number;
        };
        sizeBytes: number;
      }[]
    >([]),
    [firebaseConfigured, setFirebaseConfigured] = useState(false),
    [audit, setAudit] = useState<
      { id: string; action: string; createdAt: string; targetId: string }[]
    >([]);

  const loadBackups = useCallback(() => {
    api<{
      configured: boolean;
      backups: typeof backups;
    }>("backups")
      .then((res) => {
        setFirebaseConfigured(res.configured);
        setBackups(res.backups || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api<typeof audit>("audit")
      .then(setAudit)
      .catch(() => {});
    loadBackups();
  }, [loadBackups]);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DEIN WORKSPACE. DEINE REGELN.</span>
          <h1>Einstellungen</h1>
          <p>Die Grundlage für deine Assistenten – sicher an einem Ort.</p>
        </div>
      </div>
      <div className="settings-columns">
        <div>
          <section className="panel editor-panel">
            <h2>Workspace</h2>
            <Field label="Workspace-Name">
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Button
              onClick={async () => {
                try {
                  await write("workspace", { name }, "PATCH");
                  await onRefresh();
                  notify("Workspace gespeichert.");
                } catch (e) {
                  notify((e as Error).message);
                }
              }}
            >
              <Save size={16} /> Speichern
            </Button>
            <div className="account-info">
              <span className="profile-avatar">{me.user.name.slice(0, 1)}</span>
              <div>
                <strong>{me.user.name}</strong>
                <small>{me.user.email}</small>
              </div>
              <Badge active>Owner</Badge>
            </div>
          </section>
          <section className="panel editor-panel">
            <div className="section-heading">
              <div>
                <h2>AI-Provider</h2>
                <p>Dein Schlüssel zu guten Antworten.</p>
              </div>
              <Button variant="secondary" onClick={() => setOpen(true)}>
                <Plus size={16} /> Verbinden
              </Button>
            </div>
            {providers.length ? (
              providers.map((provider) => (
                <div className="provider-card" key={provider.id}>
                  <span className="provider-icon">
                    <Zap size={21} />
                  </span>
                  <div>
                    <strong>{provider.name}</strong>
                    <small>{provider.baseUrl}</small>
                    <code>•••• •••• {provider.keyLastFour}</code>
                  </div>
                  <button
                    className="icon-button delete"
                    aria-label={`${provider.name} entfernen`}
                    onClick={async () => {
                      try {
                        await api(`providers/${provider.id}`, {
                          method: "DELETE",
                        });
                        await onRefresh();
                        notify("Provider entfernt.");
                      } catch (e) {
                        notify((e as Error).message);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="provider-empty">
                <KeyRound size={25} />
                <h3>Bring deinen eigenen API-Key mit.</h3>
                <p>
                  Verbinde OpenAI oder einen kompatiblen Provider. Dein
                  Schlüssel bleibt verschlüsselt auf deinem Server.
                </p>
                <Button variant="secondary" onClick={() => setOpen(true)}>
                  <Plus size={15} /> Provider verbinden
                </Button>
              </div>
            )}
          </section>
          <section className="panel editor-panel">
            <div className="section-heading">
              <div>
                <h2>Cloud-Backups (Firebase)</h2>
                <p>Automatische & manuelle Backups in deiner Firebase Cloud.</p>
              </div>
              <Button
                variant="secondary"
                busy={backupBusy}
                onClick={async () => {
                  setBackupBusy(true);
                  try {
                    await write("backups", { label: "Manuelles Cloud-Backup" });
                    await loadBackups();
                    notify("Cloud-Backup erfolgreich in Firebase gespeichert.");
                  } catch (e) {
                    notify((e as Error).message);
                  } finally {
                    setBackupBusy(false);
                  }
                }}
              >
                <Cloud size={16} /> Jetzt sichern
              </Button>
            </div>
            {firebaseConfigured ? (
              backups.length ? (
                backups.map((b) => (
                  <div className="provider-card" key={b.id}>
                    <span className="provider-icon">
                      <Database size={21} />
                    </span>
                    <div>
                      <strong>{b.label}</strong>
                      <small>{date(b.createdAt)} • {(b.sizeBytes / 1024).toFixed(1)} KB</small>
                      <code>
                        {b.stats.botsCount} Bots • {b.stats.sourcesCount} Quellen • {b.stats.chunksCount} Vektoren • {b.stats.messagesCount} Nachrichten
                      </code>
                    </div>
                    <button
                      className="icon-button delete"
                      aria-label="Backup löschen"
                      onClick={async () => {
                        try {
                          await api(`backups/${b.id}`, { method: "DELETE" });
                          await loadBackups();
                          notify("Backup gelöscht.");
                        } catch (e) {
                          notify((e as Error).message);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="provider-empty">
                  <Cloud size={25} />
                  <h3>Noch keine Cloud-Backups vorhanden.</h3>
                  <p>
                    Firebase ist verbunden. Erstelle jederzeit mit einem Klick ein vollständiges Cloud-Backup deines Workspace.
                  </p>
                </div>
              )
            ) : (
              <div className="provider-empty">
                <Cloud size={25} />
                <h3>Firebase nicht konfiguriert</h3>
                <p>
                  Hinterlege die Firebase-Zugangsdaten in deiner Konfiguration, um automatische Cloud-Backups zu aktivieren.
                </p>
              </div>
            )}
          </section>
        </div>
        <div>
          <section className="privacy-panel settings-privacy">
            <ShieldCheck size={32} strokeWidth={1.5} />
            <h2>Kontrolle ist kein Extra.</h2>
            <p>
              Deine API-Keys werden mit AES-256-GCM verschlüsselt gespeichert.
              Im Widget und in öffentlichen APIs werden sie niemals
              ausgeliefert.
            </p>
            <div className="privacy-checks">
              <p>
                <Check size={16} /> AI-Anfragen ausschließlich serverseitig
              </p>
              <p>
                <Check size={16} /> Getrennte Daten für jeden Workspace
              </p>
              <p>
                <Check size={16} /> Speicherung pro Bot konfigurierbar
              </p>
            </div>
          </section>
          <section className="panel editor-panel audit-panel">
            <h2>Workspace-Aktivität</h2>
            <p>Sensible Verwaltungsaktionen im Überblick.</p>
            {audit.length ? (
              audit.slice(0, 10).map((entry) => (
                <div className="audit-entry" key={entry.id}>
                  <span>
                    <ShieldCheck size={15} />
                  </span>
                  <div>
                    <strong>{entry.action}</strong>
                    <small>{date(entry.createdAt)}</small>
                  </div>
                </div>
              ))
            ) : (
              <p className="small-empty">
                Noch keine Verwaltungsaktionen erfasst.
              </p>
            )}
          </section>
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="AI-Provider verbinden"
        description="Zugangsdaten werden vor dem Speichern geprüft und verschlüsselt abgelegt."
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const form = e.currentTarget;
            try {
              await write("providers", Object.fromEntries(new FormData(form)));
              form.reset();
              setOpen(false);
              await onRefresh();
              notify("Provider erfolgreich verbunden.");
            } catch (e) {
              notify((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Name">
            <input
              name="name"
              required
              minLength={2}
              placeholder="z. B. OpenAI – Mein Workspace"
            />
          </Field>
          <Field
            label="API Base URL"
            hint="Öffentlicher HTTPS-Endpunkt einer OpenAI-kompatiblen API."
          >
            <input
              name="baseUrl"
              type="url"
              defaultValue="https://api.openai.com/v1"
              required
            />
          </Field>
          <Field label="API-Key">
            <input
              name="apiKey"
              type="password"
              autoComplete="off"
              required
              minLength={8}
              placeholder="sk-…"
            />
          </Field>
          <div className="info-box">
            <ShieldCheck size={18} />
            <span>
              Wähle diesen Provider anschließend im Playground deines Bots aus.
            </span>
          </div>
          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" busy={busy}>
              <KeyRound size={16} /> Prüfen & verbinden
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
