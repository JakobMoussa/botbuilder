"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot as BotIcon,
  Check,
  Code2,
  Copy,
  Download,
  Globe2,
  Palette,
  Play,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  api,
  date,
  write,
  type Bot,
  type Provider,
  type Settings,
  type Widget,
} from "@/lib/client";
import { Badge, Button, Field, Modal } from "./ui";
import { ChatPreview } from "./chat-preview";
import {
  AnalyticsView,
  ConversationsView,
  KnowledgeView,
} from "./workspace-sections";
const tabs = [
  { id: "overview", title: "Übersicht" },
  { id: "playground", title: "Playground" },
  { id: "knowledge", title: "Wissensbasis" },
  { id: "conversations", title: "Konversationen" },
  { id: "analytics", title: "Analytics" },
  { id: "appearance", title: "Design" },
  { id: "settings", title: "Einstellungen" },
  { id: "embed", title: "Einbinden" },
];
export function BotDetail({
  bot,
  providers,
  onRefresh,
  notify,
}: {
  bot: Bot;
  providers: Provider[];
  onRefresh: () => Promise<void>;
  notify: (text: string) => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("tab") || "overview"
      : "overview",
  );
  const [settings, setSettings] = useState<Settings>(bot.settings),
    [widget, setWidget] = useState<Widget>(bot.widget),
    [name, setName] = useState(bot.name),
    [description, setDescription] = useState(bot.description),
    [domains, setDomains] = useState(
      bot.domains.map((x) => x.domain).join("\n"),
    ),
    [busy, setBusy] = useState(false),
    [confirmDelete, setConfirmDelete] = useState(false),
    [debug, setDebug] = useState(true),
    [models, setModels] = useState<string[]>([]);
  const changeSettings = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => setSettings((current) => ({ ...current, [key]: value }));
  const changeWidget = <K extends keyof Widget>(key: K, value: Widget[K]) =>
    setWidget((current) => ({ ...current, [key]: value }));
  async function save(data: unknown) {
    setBusy(true);
    try {
      await write(`bots/${bot.id}`, data, "PATCH");
      await onRefresh();
      notify("Änderungen gespeichert.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const embed = `<script\n  src="${typeof window !== "undefined" ? window.location.origin : ""}/chatbot.js"\n  data-bot-id="${bot.publicId}"\n  async>\n</script>`;
  const localEmbed = typeof window !== "undefined" &&
    /^(localhost|127\.[\d.]+|\[::1\])$/.test(window.location.hostname);
  return (
    <>
      <Link href="/dashboard/bots" className="back-link">
        <ArrowLeft size={15} /> Alle Chatbots
      </Link>
      <div className="page-heading bot-detail-heading">
        <div className="bot-title">
          <span
            className="bot-avatar"
            style={{
              color: widget.primaryColor,
              background: widget.primaryColor + "16",
            }}
          >
            <BotIcon size={30} />
          </span>
          <div>
            <h1>
              {bot.name} <Badge active={bot.active} />
            </h1>
            <p>{bot.description || "Dein digitaler Website-Assistent."}</p>
          </div>
        </div>
        <Button
          variant={bot.active ? "secondary" : "primary"}
          busy={busy}
          onClick={() => save({ active: !bot.active })}
        >
          {bot.active ? <Check size={16} /> : <Play size={16} />}
          {bot.active ? "Aktiv · Pausieren" : "Bot aktivieren"}
        </Button>
      </div>
      <div className="tabs bot-tabs">
        {tabs.map((x) => (
          <button
            key={x.id}
            className={tab === x.id ? "selected" : ""}
            onClick={() => {
              setTab(x.id);
              router.replace(`/dashboard/bots/${bot.id}?tab=${x.id}`, { scroll: false });
            }}
          >
            {x.title}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <>
          <div className="detail-intro">
            <span className="eyebrow">VON DER IDEE ZUM DIALOG</span>
            <h2>Ein Assistent, der nach dir klingt.</h2>
            <p>
              Gib ihm Wissen, finde den richtigen Ton und mach ihn zum Teil
              deiner Website.
            </p>
          </div>
          <div className="feature-grid">
            {[
              {
                icon: BookOpen,
                title: "Wissen verbinden",
                text: `${bot._count.sources} Quellen · Dokumente, Websites und FAQs`,
                tab: "knowledge",
                action: "Wissensbasis öffnen",
              },
              {
                icon: Sparkles,
                title: "Persönlichkeit gestalten",
                text: `${settings.model} · Prompts und Antworten testen`,
                tab: "playground",
                action: "Zum Playground",
              },
              {
                icon: Palette,
                title: "Deinen Look finden",
                text: "Farben, Begrüßung und Widget-Design anpassen",
                tab: "appearance",
                action: "Design anpassen",
              },
              {
                icon: Code2,
                title: "Den Dialog starten",
                text: `${bot.domains.length} freigegebene Domains · Einfach einbinden`,
                tab: "embed",
                action: "Embed-Code holen",
              },
            ].map((card) => (
              <button
                className="feature-card"
                key={card.tab}
                onClick={() => setTab(card.tab)}
              >
                <span>
                  <card.icon size={22} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <strong>
                  {card.action}
                  <ArrowRight size={15} />
                </strong>
              </button>
            ))}
          </div>
          <section className="panel bot-facts">
            <h2>Auf einen Blick</h2>
            <dl>
              <div>
                <dt>Öffentliche Bot-ID</dt>
                <dd>
                  <code>{bot.publicId}</code>
                  <button
                    className="icon-button"
                    aria-label="Bot-ID kopieren"
                    onClick={async () => {
                      await navigator.clipboard.writeText(bot.publicId);
                      notify("Bot-ID kopiert.");
                    }}
                  >
                    <Copy size={15} />
                  </button>
                </dd>
              </div>
              <div>
                <dt>Erstellt</dt>
                <dd>{date(bot.createdAt)}</dd>
              </div>
              <div>
                <dt>Letzte Aktivität</dt>
                <dd>{date(bot.lastActivity)}</dd>
              </div>
              <div>
                <dt>Speicherung</dt>
                <dd>
                  {settings.storeConversations
                    ? `${settings.retentionDays} Tage Aufbewahrung`
                    : "Konversationen werden nicht gespeichert"}
                </dd>
              </div>
            </dl>
          </section>
        </>
      )}
      {tab === "playground" && (
        <div className="editor-grid">
          <section className="panel editor-panel">
            <div className="section-heading">
              <div>
                <h2>Die Persönlichkeit deines Bots</h2>
                <p>Teste Änderungen direkt, bevor du sie speicherst.</p>
              </div>
              <Sparkles size={21} />
            </div>
            <Field label="AI-Provider">
              <select
                value={settings.providerId || ""}
                onChange={(e) =>
                  changeSettings("providerId", e.target.value || null)
                }
              >
                <option value="">Server-Key (OPENAI_API_KEY)</option>
                {providers.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            {!providers.length && (
              <p className="field-hint">
                Verbinde deinen eigenen Key unter{" "}
                <Link href="/settings">Workspace-Einstellungen</Link>.
              </p>
            )}
            <Field label="Modell">
              <div className="input-action">
                <input
                  list="provider-models"
                  value={settings.model}
                  onChange={(e) => changeSettings("model", e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      setModels(
                        await api(
                          `providers/${settings.providerId || "environment"}/models`,
                        ),
                      );
                      notify("Verfügbare Modelle geladen.");
                    } catch (e) {
                      notify((e as Error).message);
                    }
                  }}
                >
                  Laden
                </Button>
              </div>
              <datalist id="provider-models">
                {models.map((m) => (
                  <option value={m} key={m} />
                ))}
              </datalist>
            </Field>
            <Field
              label="System-Prompt"
              hint="Beschreibe Rolle, Ton und Grenzen deines Assistenten."
            >
              <textarea
                rows={7}
                value={settings.systemPrompt}
                onChange={(e) => changeSettings("systemPrompt", e.target.value)}
              />
            </Field>
            <div className="form-row">
              <Field
                label={`Temperature · ${settings.temperature}`}
                hint="Fokussiert → kreativ"
              >
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) =>
                    changeSettings("temperature", +e.target.value)
                  }
                />
              </Field>
              <Field label="Max. Antwort-Tokens">
                <input
                  type="number"
                  min="100"
                  max="8192"
                  value={settings.maxTokens}
                  onChange={(e) => changeSettings("maxTokens", +e.target.value)}
                />
              </Field>
            </div>
            <Field
              label="Antwort bei fehlendem Wissen"
              hint="Wird verwendet, wenn eine Frage nicht beantwortet werden kann."
            >
              <textarea
                rows={3}
                placeholder="Dazu liegen mir leider keine ausreichenden Informationen vor. Bitte kontaktiere unser Team."
                value={settings.unknownAnswer}
                onChange={(e) =>
                  changeSettings("unknownAnswer", e.target.value)
                }
              />
            </Field>
            <div className="form-row">
              <Field label="Sprache">
                <select
                  value={settings.language}
                  onChange={(e) => changeSettings("language", e.target.value)}
                >
                  <option>Deutsch</option>
                  <option>English</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
              </Field>
              <Field
                label="Min. Similarity Score"
                hint="Wert zwischen 0.0 und 1.0 (z. B. 0.35)"
              >
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.similarityThreshold}
                  onChange={(e) => {
                    const val = +e.target.value;
                    changeSettings(
                      "similarityThreshold",
                      val > 1 ? val / 100 : val,
                    );
                  }}
                />
              </Field>
            </div>
            <label className="toggle-row">
              <span>
                <strong>Debug-Modus</strong>
                <small>
                  Zeigt RAG-Kontext und Verbrauch nur hier im Playground.
                </small>
              </span>
              <input
                type="checkbox"
                checked={debug}
                onChange={(e) => setDebug(e.target.checked)}
              />
            </label>
            <Button busy={busy} onClick={() => save({ settings })}>
              <Save size={16} /> Einstellungen speichern
            </Button>
          </section>
          <ChatPreview
            bot={bot}
            settings={settings}
            widget={widget}
            debugEnabled={debug}
          />
        </div>
      )}
      {tab === "knowledge" && (
        <KnowledgeView bot={bot} bots={[bot]} notify={notify} />
      )}
      {tab === "conversations" && (
        <ConversationsView bot={bot} bots={[bot]} notify={notify} />
      )}
      {tab === "analytics" && <AnalyticsView bot={bot} />}
      {tab === "appearance" && (
        <div className="editor-grid">
          <section className="panel editor-panel">
            <div className="section-heading">
              <div>
                <h2>Dein Look. Dein Dialog.</h2>
                <p>
                  Ein Assistent, der sich auf deiner Website zu Hause fühlt.
                </p>
              </div>
              <Palette size={22} />
            </div>
            <Field label="Angezeigter Name">
              <input
                value={widget.displayName}
                onChange={(e) => changeWidget("displayName", e.target.value)}
              />
            </Field>
            <Field label="Begrüßung">
              <textarea
                rows={3}
                value={widget.greeting}
                onChange={(e) => changeWidget("greeting", e.target.value)}
              />
            </Field>
            <Field label="Platzhalter">
              <input
                value={widget.placeholder}
                onChange={(e) => changeWidget("placeholder", e.target.value)}
              />
            </Field>
            <div className="form-row">
              <Field label="Primärfarbe">
                <div className="color-field">
                  <input
                    type="color"
                    value={widget.primaryColor}
                    onChange={(e) =>
                      changeWidget("primaryColor", e.target.value)
                    }
                  />
                  <code>{widget.primaryColor}</code>
                </div>
              </Field>
              <Field label="Textfarbe auf Primärfarbe">
                <div className="color-field">
                  <input
                    type="color"
                    value={widget.textColor}
                    onChange={(e) => changeWidget("textColor", e.target.value)}
                  />
                  <code>{widget.textColor}</code>
                </div>
              </Field>
            </div>
            <div className="color-presets">
              {[
                "#7360df",
                "#2563eb",
                "#0d9488",
                "#e28446",
                "#252a35",
                "#d95087",
              ].map((c) => (
                <button
                  key={c}
                  aria-label={`Farbe ${c}`}
                  onClick={() => changeWidget("primaryColor", c)}
                  style={{ background: c }}
                >
                  {widget.primaryColor === c && <Check size={16} />}
                </button>
              ))}
            </div>
            <div className="form-row">
              <Field label="Position">
                <select
                  value={widget.position}
                  onChange={(e) => changeWidget("position", e.target.value)}
                >
                  <option value="right">Unten rechts</option>
                  <option value="left">Unten links</option>
                </select>
              </Field>
              <Field label="Theme">
                <select
                  value={widget.theme}
                  onChange={(e) => changeWidget("theme", e.target.value)}
                >
                  <option value="light">Hell</option>
                  <option value="dark">Dunkel</option>
                </select>
              </Field>
            </div>
            <Field label={`Abgerundete Ecken · ${widget.radius}px`}>
              <input
                type="range"
                min="0"
                max="32"
                value={widget.radius}
                onChange={(e) => changeWidget("radius", +e.target.value)}
              />
            </Field>
            <Field label="Avatar-URL (HTTPS)">
              <input
                type="url"
                value={widget.avatarUrl}
                onChange={(e) => changeWidget("avatarUrl", e.target.value)}
                placeholder="https://deine-website.de/avatar.png"
              />
            </Field>
            <Field label="Logo-URL (HTTPS)">
              <input
                type="url"
                value={widget.logoUrl}
                onChange={(e) => changeWidget("logoUrl", e.target.value)}
                placeholder="https://deine-website.de/logo.png"
              />
            </Field>
            <Field label="Chat-Button-Icon">
              <select
                value={widget.buttonIcon}
                onChange={(e) => changeWidget("buttonIcon", e.target.value)}
              >
                <option value="message">Sprechblase</option>
                <option value="sparkles">Sparkles</option>
                <option value="bot">Roboter</option>
              </select>
            </Field>
            <label className="toggle-row">
              <span>
                <strong>Dialogue-Branding anzeigen</strong>
                <small>Kleiner Hinweis am unteren Rand des Widgets.</small>
              </span>
              <input
                type="checkbox"
                checked={widget.branding}
                onChange={(e) => changeWidget("branding", e.target.checked)}
              />
            </label>
            <Button busy={busy} onClick={() => save({ widget })}>
              <Save size={16} /> Design speichern
            </Button>
          </section>
          <ChatPreview
            bot={bot}
            settings={settings}
            widget={widget}
            interactive={false}
          />
        </div>
      )}
      {tab === "settings" && (
        <div className="settings-columns">
          <section className="panel editor-panel">
            <h2>Allgemein</h2>
            <Field label="Interner Name">
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Interne Beschreibung">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field
              label="Embedding-Modell"
              hint="1536 Dimensionen erforderlich. Ein Wechsel indexiert die Quellen neu."
            >
              <input
                value={settings.embeddingModel}
                onChange={(e) =>
                  changeSettings("embeddingModel", e.target.value)
                }
              />
            </Field>
            <Field label="Maximale Chat-Anfragen pro Tag">
              <input
                type="number"
                min="1"
                max="100000"
                value={settings.dailyRequestLimit}
                onChange={(e) =>
                  changeSettings("dailyRequestLimit", +e.target.value)
                }
              />
            </Field>
            <h3>Geschätzte Kosten</h3>
            <p className="field-hint">
              USD pro 1 Million Tokens. Trage die Preise deines Providers ein; 0
              bedeutet, dass Kosten noch nicht konfiguriert sind.
            </p>
            <div className="form-row">
              <Field label="Input">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.inputCostPerMillion}
                  onChange={(e) =>
                    changeSettings("inputCostPerMillion", +e.target.value)
                  }
                />
              </Field>
              <Field label="Output">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.outputCostPerMillion}
                  onChange={(e) =>
                    changeSettings("outputCostPerMillion", +e.target.value)
                  }
                />
              </Field>
              <Field label="Embeddings">
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={settings.embeddingCostPerMillion}
                  onChange={(e) =>
                    changeSettings("embeddingCostPerMillion", +e.target.value)
                  }
                />
              </Field>
            </div>
            <Button
              busy={busy}
              onClick={() => save({ name, description, settings })}
            >
              <Save size={16} /> Änderungen speichern
            </Button>
          </section>
          <div>
            <section className="panel editor-panel">
              <h2>
                <ShieldCheck size={20} /> Datenschutz
              </h2>
              <label className="toggle-row">
                <span>
                  <strong>Konversationen speichern</strong>
                  <small>
                    Deaktivieren löscht vorhandene Gespräche samt zugehörigem
                    Verbrauch.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={settings.storeConversations}
                  onChange={(e) =>
                    changeSettings("storeConversations", e.target.checked)
                  }
                />
              </label>
              <label className="toggle-row">
                <span>
                  <strong>Analytics erfassen</strong>
                  <small>
                    Deaktivieren löscht alle vorhandenen Verbrauchsdatensätze.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={settings.analyticsEnabled}
                  onChange={(e) =>
                    changeSettings("analyticsEnabled", e.target.checked)
                  }
                />
              </label>
              <Field
                label="Aufbewahrung (Tage)"
                hint="Der Worker löscht abgelaufene Daten stündlich."
              >
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.retentionDays}
                  onChange={(e) =>
                    changeSettings("retentionDays", +e.target.value)
                  }
                />
              </Field>
              <Button variant="secondary" onClick={() => save({ settings })}>
                Datenschutz speichern
              </Button>
              <a
                className="button ghost export-button"
                href={`/api/bots/${bot.id}/export`}
                download
              >
                <Download size={16} /> Gespräche exportieren
              </a>
            </section>
            <section className="panel editor-panel danger-zone">
              <h3>Bot verwalten</h3>
              <p>
                Eine Kopie startet als Entwurf mit eigenen Wissensquellen. Beim
                Löschen werden alle zugehörigen Daten entfernt.
              </p>
              <div className="form-row">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const copy = await write<Bot>(
                        `bots/${bot.id}/duplicate`,
                        {},
                      );
                      await onRefresh();
                      router.push(`/dashboard/bots/${copy.id}`);
                      notify("Chatbot dupliziert.");
                    } catch (e) {
                      notify((e as Error).message);
                    }
                  }}
                >
                  <Copy size={15} /> Duplizieren
                </Button>
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={15} /> Löschen
                </Button>
              </div>
            </section>
          </div>
        </div>
      )}
      {tab === "embed" && (
        <div className="settings-columns">
          <section className="panel editor-panel">
            <span className="section-icon">
              <Globe2 size={23} />
            </span>
            <h2>Ein Zuhause für deinen Bot.</h2>
            <p>
              Gib die Domains frei, auf denen dein Assistent verwendet werden
              darf.
            </p>
            <Field
              label="Erlaubte Domains"
              hint="Eine Domain pro Zeile, ohne https:// oder Pfad. Subdomains einzeln eintragen; bei lokalen Tests den Port ergänzen."
            >
              <textarea
                rows={5}
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                placeholder={"example.com\nwww.example.com\nlocalhost:8080"}
              />
            </Field>
            <Button
              busy={busy}
              onClick={() =>
                save({
                  domains: domains
                    .split("\n")
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            >
              <ShieldCheck size={16} /> Domains speichern
            </Button>
            <div className="info-box">
              <ShieldCheck size={18} />
              <span>
                Nur Anfragen von exakt freigegebenen Domains werden verarbeitet.
                Aktiviere anschließend deinen Bot.
              </span>
            </div>
          </section>
          <section className="panel editor-panel">
            <span className="section-icon">
              <Code2 size={23} />
            </span>
            <h2>Ein Snippet. Bereit für Dialog.</h2>
            <p>
              Füge diesen Code vor dem schließenden <code>&lt;/body&gt;</code>
              -Tag deiner Website ein.
            </p>
            <pre className="code-block">{embed}</pre>
            {localEmbed && (
              <div className="info-box">
                <Globe2 size={18} />
                <span>Dieses Snippet verwendet eine lokale Adresse und ist nur für lokale Tests geeignet. Für deine Website muss Dialogue öffentlich über HTTPS erreichbar sein. Öffne das Dashboard anschließend über diese Adresse und kopiere den Code erneut.</span>
              </div>
            )}
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(embed);
                notify("Embed-Code kopiert.");
              }}
            >
              <Copy size={16} /> Code kopieren
            </Button>
            <div className="embed-checks">
              <p>
                <Check size={16} /> Responsive auf Desktop und Mobile
              </p>
              <p>
                <Check size={16} /> Styles durch Shadow DOM isoliert
              </p>
              <p>
                <Check size={16} /> API-Schlüssel bleiben auf dem Server
              </p>
            </div>
          </section>
        </div>
      )}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Diesen Chatbot löschen?"
        description={`„${bot.name}“ sowie alle Wissensquellen, Gespräche und Statistiken werden dauerhaft gelöscht.`}
      >
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Abbrechen
          </Button>
          <Button
            variant="danger"
            busy={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api(`bots/${bot.id}`, { method: "DELETE" });
                await onRefresh();
                router.push("/dashboard/bots");
                notify("Chatbot gelöscht.");
              } catch (e) {
                notify((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Endgültig löschen
          </Button>
        </div>
      </Modal>
    </>
  );
}
