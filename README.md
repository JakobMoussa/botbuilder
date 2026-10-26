# Dialogue

Ein self-hosted Chatbot Builder mit deutschsprachigem Dashboard, eigener Wissensbasis und einbettbarem Website-Widget. Next.js, TypeScript, Tailwind, Radix-Dialoge im shadcn-Stil, PostgreSQL, Prisma und pgvector.

## Lokal starten

Voraussetzung: Docker mit Compose und mindestens etwa 3 GB freiem Arbeitsspeicher für den ersten Build.

```sh
docker compose up -d
```

Öffne **http://localhost:3000**. Erstelle beim ersten Besuch deinen Account und Workspace. Es gibt keine Standard-Zugangsdaten, keine Demo-Gespräche und keine vorgegebenen API-Schlüssel. Der erste Build lädt die Abhängigkeiten und kann einige Minuten dauern.

Die Anmeldung ist direkt unter **/login** erreichbar; **/register** erstellt bei freigegebener Registrierung einen Account. Der Sonne-/Mond-Schalter auf der Anmeldeseite und im Dashboard wechselt zwischen hellem und dunklem Modus. Die Auswahl wird in diesem Browser gespeichert; ohne Auswahl gilt die Systemeinstellung. Das Website-Widget behält sein separat konfiguriertes Theme.

Die Datenbankmigration läuft automatisch im `init`-Container. `web` stellt die Anwendung bereit, `worker` verarbeitet die Wissensquellen. PostgreSQL und Verschlüsselungsgeheimnisse werden in getrennten Docker-Volumes gespeichert. Ohne `.env` werden `AUTH_SECRET` und `ENCRYPTION_KEY` beim ersten Start zufällig erzeugt. Die Registrierung weiterer Accounts ist standardmäßig geschlossen; ein vorhandener Account kann mehrere Workspaces erstellen und zwischen ihnen wechseln.

```sh
docker compose ps
docker compose logs --tail=50 web worker init
docker compose stop
# Nach Codeänderungen:
docker compose build web
docker compose up -d
```

`docker compose down` entfernt die Container, erhält aber die Volumes. Das zusätzliche Flag `-v` würde Datenbank **und** generierte Schlüssel dauerhaft löschen. Schlüssel und Datenbank immer zusammen sichern.

## Einen Bot live bringen

Optional können neue Benutzerkonten über Firebase Authentication verwaltet werden.
Einrichtung und Verhalten bestehender Konten: [Firebase-Benutzeranmeldung](docs/FIREBASE-AUTH.md).
Die App benötigt weiterhin PostgreSQL, den Node.js-Server und den Worker.

1. Unter **Einstellungen → AI-Provider → Verbinden** Name, HTTPS-API-Basis-URL und API-Key eingeben. Die Verbindung wird über `/models` geprüft. Alternativ `OPENAI_API_KEY` serverseitig setzen.
2. **Chatbot erstellen**. Im **Playground** Provider, Modell, System-Prompt und Sprache wählen und speichern. Vorgaben sind `gpt-4o-mini` und `text-embedding-3-small`; Verfügbarkeit hängt vom Provider-Account ab. „Laden“ holt die verfügbaren Modelle vom Provider.
3. Unter **Wissensbasis** Text, FAQ, TXT, Markdown, PDF, DOCX, URL oder einen Domain-Crawl hinzufügen. Auf den Status **Bereit** warten. Ein Fehler ohne Provider ist erwartbar: Provider zuordnen und „Neu indexieren“ wählen.
4. Im **Playground** Fragen stellen. Der Debug-Bereich zeigt Modell, gefundene Chunks, Scores, Kontext, Tokens und Laufzeit. Änderungen können vor dem Speichern getestet werden. Testgespräche sind von Live-Analytics ausgeschlossen.
5. Unter **Design** Farben, Avatar, Logo, Begrüßung, Eingabeplatzhalter, Position, Radius, Theme, Icon und Branding konfigurieren.
6. Unter **Einbinden** Domains eintragen, z. B. `example.com` und `www.example.com`, jeweils ohne Schema oder Pfad. Für lokale Tests den Port ergänzen, etwa `localhost:8080`. Den Bot aktivieren und das Snippet in die Website kopieren.
7. Unter **Einstellungen** des Bots die aktuellen Provider-Preise in **USD pro Million Tokens** hinterlegen. Ohne konfigurierte Preise ist die Kostenschätzung 0. Preise werden bewusst nicht als dauerhaft gültige Tarifliste fest eingebaut.

```html
<script
  src="https://chat.example.com/chatbot.js"
  data-bot-id="DEINE-OEFFENTLICHE-BOT-ID"
  async
></script>
```

Das Widget verwendet Shadow DOM, `textContent` für Nachrichten, SSE-Streaming und eine zufällige Gesprächs-Capability. Es speichert seine Sitzung nur im Arbeitsspeicher der Seite. Ein Neuladen beginnt einen neuen Besuch. Für Nachrichten werden keine Namen, E-Mail-Adressen oder Telefonnummern abgefragt. Feedback ist bei gespeicherten Antworten verfügbar. Auf Websites mit eigener Content Security Policy müssen die App-Domain für `script-src`/`connect-src`, die konfigurierten Bild-URLs und die Widget-Styles zugelassen werden.

## Funktionsumfang

- Session-Anmeldung und Logout; mehrere Workspaces pro Account; Mitglieder- und Rollenmodell für spätere Einladungen.
- Bots erstellen, bearbeiten, duplizieren, aktivieren, pausieren und einschließlich abhängiger Daten löschen.
- Serverseitige OpenAI-kompatible Chat-/Embedding-Anbindung mit `AIProvider`-Interface (`chat`, `embeddings`, `validateCredentials`, `getModels`).
- Verschlüsselte Provider-Zugangsdaten; API-Ausgaben enthalten nur Metadaten und die letzten vier Zeichen des Keys.
- Persistente Import-Warteschlange in PostgreSQL; Worker mit atomarer Job-Auswahl, atomarem Chunk-Austausch, Fehlerstatus und Neuindexierung.
- Getrennte Bot-Wissensbasen, exakte pgvector-Cosinus-Suche und konfigurierbarer Mindestscore. Ohne passende Quelle wird die konfigurierte Unbekannt-Antwort ausgegeben.
- Playground mit ungespeicherten Prompt-Einstellungen und internem Debug-Kontext; Live-Design-Vorschau.
- Widget mit Domain-Freigaben, Streaming, Ladezustand, Fehlerdarstellung, neuer Unterhaltung und Feedback.
- Gesprächsverläufe, Tokens, geschätzte Kosten, Antwortzeiten, Zeitraumfilter, häufige Fragen, Feedback und Hinweise auf Wissenslücken.
- JSON-Export, Löschung einzelner Gespräche, Bot-Löschung und konfigurierbare Aufbewahrungsfristen.

## Architektur und Ordner

```text
src/
  app/
    [[...view]]/page.tsx           Dashboard-Routen
    api/[...path]/route.ts         API-Einstieg, dynamisch und serverseitig
    widget/[botId]/config/         Explizite öffentliche Konfigurationsroute
    globals.css                   Responsive Oberfläche
  components/
    workspace-app.tsx             Navigation, Workspace-Auswahl, Dashboard
    bot-detail.tsx                Bot-Konfiguration und Embed
    workspace-sections.tsx        Wissen, Gespräche, Analytics, Provider
    chat-preview.tsx              Streaming-Playground
    ui.tsx                        Gemeinsame UI-Primitiven und Radix-Dialog
  lib/
    api.ts                        Admin-/Public-Routing und Autorisierung
    auth.ts, security.ts          Sessions, CSRF, Secrets, Rate Limits
    validation.ts                 Zod-Schemas
    providers.ts                  Provider-Interface und OpenAI-Adapter
    chat.ts                       RAG-Orchestrierung, SSE und Persistenz
    knowledge.ts, network.ts       Chunking, Crawler und DNS-Pinning
    uploads.ts                    Upload-Validierung, isolierte Extraktion
    analytics.ts                  Tenant-gefilterte Aggregation
    db.ts, client.ts              DB-Zugriff / typisierter UI-Client
  worker.ts                       Importjobs und Retention
scripts/
  boot.mjs                        Geheimnisse, Migration und Prozessstart
  extract-file.ts                 Begrenzter PDF-/DOCX-Parserprozess
prisma/
  schema.prisma                   Datenmodell
  migrations/                    SQL-Migrationen inklusive pgvector
public/chatbot.js                 Eigenständiges Website-Widget
tests/                           Unit-, DB-Integrations- und Browsertests
docs/                            API und Architekturentscheidungen
```

Der API-Einstieg bündelt das Routing; Authentifizierung, Provider, Wissensverarbeitung und Chat-Pipeline liegen in eigenständigen Modulen. Neue Provider werden am `AIProvider`-Interface ergänzt. Billing, Einladungen, Integrationen, Tools und Human Handoff sind nicht implementiert; Workspaces, Mitgliedschaften, Provider-Referenzen und UsageRecords bilden die vorgesehenen Erweiterungspunkte.

## Konfiguration

Siehe [`.env.example`](.env.example). Für Docker ist keine manuelle Konfiguration zum ersten lokalen Start erforderlich.

| Variable             | Verwendung                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Für native Entwicklung; Compose verbindet intern mit `db:5432`.                                           |
| `APP_URL`            | Exakter öffentlicher App-Ursprung, inklusive Port; für CSRF und sichere Cookies.                          |
| `AUTH_SECRET`        | Mindestens 32 Zeichen. Hashing von Session-Capabilities und Rate-Limit-Schlüsseln.                        |
| `ENCRYPTION_KEY`     | 64 Hex-Zeichen = 32 Byte AES-256-Schlüssel.                                                               |
| `POSTGRES_PASSWORD`  | Lokale Vorgabe nur für lokale Entwicklung. Bei neuen Serverinstallationen vor dem ersten DB-Start ändern. |
| `OPENAI_API_KEY`     | Optionaler serverweiter Fallback; alternativ Provider pro Workspace verbinden.                            |
| `ALLOW_REGISTRATION` | Standard `false`; nur der erste Account darf registrieren. `true` öffnet weitere Registrierungen.         |
| `TRUST_PROXY`        | Standard `false`; nur mit einem vorgeschalteten Proxy aktivieren, der `X-Forwarded-For` überschreibt.     |
| `PORT`               | Docker-Web-Port; Standard 3000, nur an `127.0.0.1` gebunden. `APP_URL` passend ändern.                    |

Geheimnisse nie in Client-Variablen (`NEXT_PUBLIC_*`) ablegen. Ein Wechsel des Verschlüsselungsschlüssels ohne Migration macht vorhandene Provider-Keys unlesbar. `.env` ist von Git und Docker-Build-Kontext ausgeschlossen.

## Sicherheit und Datenhaltung

Admin-Anfragen benötigen eine gültige Datenbank-Session und aktuelle Workspace-Mitgliedschaft. Session-Cookies sind HttpOnly/SameSite=Lax und bei einer HTTPS-`APP_URL` Secure. Schreibende Admin-Anfragen prüfen den exakten `Origin`. Passwörter werden gesalzen mit scrypt gehasht. Öffentliche APIs erhalten keine Provider-Schlüssel, System-Prompts oder Debug-Chunks. Datenbankabfragen verwenden Prisma beziehungsweise parametrisierte SQL-Templates.

Domain-Freigaben sind **keine Besucherauthentifizierung**: Nicht-Browser-Clients können Origin-Header nachahmen. Das Backend prüft trotzdem Bot-Status und exakte Domain, unabhängig von der CORS-Freigabe, und begrenzt Anfragen pro Bot, Session und IP-Bucket. Ohne vertrauenswürdigen Proxy wird ein gemeinsamer IP-Bucket verwendet, da Next.js-Requests keine verlässliche Client-IP bereitstellen. Öffentliche Bots haben außerdem ein konfigurierbares tägliches Request-Limit; für öffentlich erreichbare Produktion sind vorgeschaltete Ressourcen- und Kostenlimits sinnvoll.

Crawling und Provider-HTTP verbinden nur zu öffentlich routbaren Adressen. DNS wird aufgelöst, geprüft und für die Verbindung festgesetzt. Private, Loopback-, Link-local-, IPv4-mapped-IPv6- und reservierte Ziele werden blockiert. Crawler-Weiterleitungen werden erneut geprüft und dürfen die Domain nicht verlassen. Provider-Weiterleitungen werden nicht verfolgt. Bot-Ausgaben werden als Text gerendert, auch wenn sie HTML enthalten.

Uploads sind auf 5 MB begrenzt. Erweiterung, MIME-Typ und bei PDF/DOCX Dateisignatur werden geprüft. PDF-/DOCX-Verarbeitung läuft in einem separaten Prozess ohne App-Secrets im Environment, mit 20-Sekunden-Limit und 192-MB-V8-Heap. Zusätzlich gelten maximal 100 PDF-Seiten, 500.000 extrahierte Zeichen und deklarierte DOCX-Entpackgrenzen. Die Originaldatei wird nicht dauerhaft gespeichert. Ein vollständiger Malware-Scanner ist nicht enthalten.

Aufbewahrung ist pro Bot zwischen 1 und 365 Tagen einstellbar. Der Worker entfernt stündlich alte Gespräche und Verbrauchsdaten sowie abgelaufene Sessions und Rate-Limit-Einträge. Audit-Metadaten werden 90 Tage aufbewahrt. Das Abschalten der Gesprächsspeicherung löscht bisherige Gespräche inklusive daran gebundener UsageRecords. Das Abschalten von Analytics löscht alle UsageRecords des Bots. Gesprächsinhalt wird weiterhin gespeichert, wenn dessen eigener Schalter aktiv bleibt. Exporte enthalten gespeicherte Gesprächsinhalte; sie sind entsprechend zu behandeln.

Die Anwendung speichert keine Klartext-IP-Adressen und protokolliert keine Provider-Keys oder Prompt-Inhalte. Relevante Wissensauszüge und Chat-Kontext werden zur Beantwortung an den gewählten AI-Provider übertragen. Die technischen Datenschutzfunktionen ersetzen keine Prüfung der konkreten Betriebs- und Provider-Konfiguration.

## Entwicklungsbetrieb und Prüfungen

Node.js 22 und npm verwenden. In `.env` eigene Schlüssel setzen, beispielsweise jeweils mit `openssl rand -hex 32`. Für die native Verbindung lautet `DATABASE_URL` im folgenden Setup `postgresql://dialogue:dialogue-local-only@localhost:54329/dialogue`.

```sh
npm ci
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
npm run db:migrate
npm run db:generate
npm run dev
# In einem zweiten Terminal (tsx lädt .env nicht selbst):
node --env-file=.env --import tsx src/worker.ts
```

Der native Dev-Server und der Docker-Web-Container können nicht gleichzeitig Port 3000 verwenden. Bei Bedarf zuerst `docker compose stop web worker` ausführen.

```sh
npm run check              # TypeScript, ESLint, Unit-Tests, Prisma-Schema
npm run build              # Produktionsbuild
npm run test:integration   # Echte DB + pgvector; deterministischer AI-Testadapter
npx playwright install chromium
npm run test:browser       # Laufende App auf APP_URL und DB aus .env erforderlich
npm audit
```

Integrations- und Browsertests erzeugen eigene zufällig benannte Accounts und Workspaces und entfernen sie anschließend. Trotzdem eine Entwicklungs-/Testdatenbank verwenden. Der Browser-Test benötigt zusätzlich den freien lokalen Port 3002. Screenshots und Fehler-Traces liegen in `test-results/`.

Die Integrationstests prüfen Tenant-Isolation, Authentifizierung/CSRF, Secret-Ausgaben, Domain-Schutz, tatsächliche pgvector-Indexierung, RAG-Abfrage, SSE-Persistenz, Gesprächs-Capabilities, Feedback, Preview-Isolation, Datenschutz und kaskadierendes Löschen. Der Provider ist dort deterministisch ersetzt; **ein erfolgreicher Test ist kein Live-OpenAI-Nachweis**. Ein echter End-to-End-Modelltest benötigt deinen API-Key und verursacht ggf. Providerkosten.

## Grenzen dieser Version

- Der Crawler liest serverseitiges HTML, führt kein JavaScript aus und importiert höchstens 20 Seiten/500.000 Zeichen. robots.txt wird konservativ interpretiert; Disallow-Regeln werden unabhängig vom User-Agent beachtet. Login-Seiten, JS-SPAs und OCR sind nicht unterstützt.
- Embeddings benötigen 1536 Dimensionen. OpenAI-kompatible APIs müssen Chat-Completions-SSE sowie das Embedding-Format unterstützen. Bei anderen Modellen können zusätzliche Adapteroptionen erforderlich sein. Lokale/private Ollama-Endpunkte sind wegen der Netzwerksperre derzeit bewusst nicht freigegeben; ein separater vertrauenswürdiger Adapter ist der Erweiterungspunkt.
- Gesprächslisten sind auf die neuesten 100 Einträge begrenzt; workspaceweite Quellenübersichten auf 500. Der JSON-Export enthält alle gespeicherten Gespräche des gewählten Bots. Cursor-Paginierung und große asynchrone Exporte sind spätere Ausbauschritte.
- Neue Browserbesuche starten neue Sessions. „Eindeutige Sessions“ ist keine geräteübergreifende Personenmessung. Bei deaktivierter Gesprächsspeicherung wird auch kein Verlauf für Folgefragen gespeichert.
- Im Erfolgsfall werden Provider-Tokens übernommen; fehlt Usage im ansonsten abgeschlossenen Stream, wird die Zeichenlänge als markierte Schätzung verwendet. Abgebrochene Provider-Streams können nicht vollständig mit der Providerrechnung abgeglichen werden. Die Kostenschätzung ist keine Abrechnung.
- Kein Passwort-Reset per E-Mail, keine Einladungsoberfläche, kein MFA, kein Billing, keine externen Messenger, keine Lead-Erfassung und kein Human Handoff. Das Datenmodell bereitet diese Erweiterungen vor.
- Sicherheitsfunktionen und Tests sind implementiert; ein unabhängiges Security-Audit, Lasttest und rechtliche Betriebsbewertung sind nicht Bestandteil dieser Implementierung.

## VPS-Betrieb

Ein bereinigtes Upload-Paket erzeugst du mit `npm run package:upload`.
Übertrage `upload/dialogue-upload.zip` oder den Inhalt von `upload/dialogue/`.
Es enthält eine eigene Server-Konfiguration und keine lokalen Zugangsdaten.
Die Dateiliste und Startschritte stehen in [deploy/UPLOAD.md](deploy/UPLOAD.md).
Reiner PHP-/HTML-Webspace kann diese Anwendung nicht ausführen.

Einen TLS-Reverse-Proxy vor den an localhost gebundenen Web-Port setzen, `APP_URL` auf die HTTPS-Domain konfigurieren und `X-Forwarded-For` durch den Proxy überschreiben, bevor `TRUST_PROXY=true` gesetzt wird. Proxy-Buffering für SSE deaktivieren, Body-Limits auf etwa 6 MB setzen und Timeouts über der Provider-Laufzeit halten. Die erste Account-Erstellung vor öffentlicher Freigabe abschließen. Datenbank und Schlüsselvolumes sichern, Restore prüfen und Images/Abhängigkeiten regelmäßig aktualisieren.

Weitere Details: [API](docs/API.md), [Architekturentscheidungen und Phasen](docs/ARCHITECTURE.md).
