# Architekturentscheidungen und Umsetzung

## Modularer Monolith und Worker

Next.js stellt UI und HTTP-API bereit. Prisma verwaltet die relationalen Daten; pgvector liegt in derselben Datenbank. Dadurch benötigen lokaler Betrieb, Backup und Transaktionen keine zusätzliche Vector-Datenbank oder Redis. Der Worker nutzt `FOR UPDATE SKIP LOCKED` zur atomaren Auswahl von Importjobs; mehrere Worker können unterschiedliche Quellen verarbeiten.

Die Wissensquellen selbst bilden die persistente Job-Warteschlange. Ein fehlgeschlagener Reindex veröffentlicht keinen teilweise geschriebenen Vektorsatz. Jeder Chunk ist sowohl einem Bot als auch einer Quelle zugeordnet; der zusammengesetzte Foreign Key verhindert eine botfremde Quellenzuordnung. Die exakte Vektorsuche filtert nach Bot und Embedding-Modell, bevor die besten fünf Treffer zurückgegeben werden. Für große Datenmengen wäre ein gezielt gemessener HNSW-/Partitionierungs-Ausbau sinnvoll; er wird hier nicht ungeprüft eingeführt.

## Tenant-Grenze

`User → WorkspaceMember → Workspace → Bot → Quellen / Gespräche / Usage`. Sessions referenzieren den aktiven Workspace; jede Anfrage prüft die Mitgliedschaft erneut. `ownedBot()` vereinheitlicht Bot-Autorisierung. Provider-Referenzen werden zusätzlich gegen den Workspace geprüft. Öffentliche Gespräche sind durch Bot-ID plus zufällige, serverseitig gehashte Session-Capability gebunden. Es gibt keine öffentliche API zum Auflisten von Gesprächen oder Wissen.

Das ist eine Isolation auf Anwendungsebene mit relationalen Konsistenzprüfungen; PostgreSQL Row-Level Security ist nicht eingerichtet. Neue Endpunkte müssen dieselben Autorisierungsschritte und Tests übernehmen.

## Provider und RAG

Der initiale Adapter implementiert OpenAI-kompatible Chat Completions, Modelle und Embeddings. Er ist serverseitig, verwendet kontrollierte HTTP-Verbindungen und hält API-Keys außerhalb aller Client-Responses. Chat Completions wurde wegen der geforderten Kompatibilität gewählt. Für neue Provider werden eigene Adapter hinter `AIProvider` ergänzt.

Chunks sind begrenzte, überlappende Textabschnitte. Für eine Frage wird ein Embedding erzeugt und nur im aktuellen Bot gesucht. Quelle und Abschnitt werden als nicht vertrauenswürdiger Kontext gekennzeichnet. Ohne Treffer wird deterministisch die konfigurierte Unbekannt-Antwort verwendet. Prompt-Regeln vermindern Instruktionsübernahme aus Dokumenten; sie sind keine Garantie gegen beliebige Prompt Injection. Der Datenzugriff wird unabhängig davon serverseitig eingeschränkt.

## Geheimnisse und Sessions

API-Keys werden mit AES-256-GCM und zufälliger Nonce authentifiziert verschlüsselt. Passwörter nutzen scrypt mit zufälligem Salt. 256-Bit-Sessions werden nur als HMAC-Hash gespeichert, laufen nach sieben Tagen ab und sind widerrufbar. In Docker generiert der einmalige Init-Prozess fehlende Secrets in einem nur für den App-User lesbaren Volume. Migrationen müssen erfolgreich sein, bevor App und Worker starten.

## Erweiterungspunkte

WorkspaceMember/Role erlaubt spätere Einladungen. BotSettings referenziert Provider-Zugangsdaten; weitere Adapter benötigen keine Änderungen am öffentlichen Widget. UsageRecord trennt Laufzeit/Verbrauch von Nachrichten und bereitet Quoten/Billing vor. Eine CRM-, Webhook- oder Handoff-Schicht kann an der gespeicherten Conversation ansetzen. Diese Features werden noch nicht als vorhanden dargestellt.

## Phasen

| Phase | Implementiertes Ergebnis                                                          |
| ----- | --------------------------------------------------------------------------------- |
| 1     | Projektstruktur, Docker/Init, PostgreSQL/pgvector, Prisma-Migration, Session-Auth |
| 2     | Workspace-Erstellung/-Wechsel, Bot-CRUD, Duplikate, Aktivierung                   |
| 3     | Provider-Interface, Credential-Validierung, AES-GCM, Modellliste                  |
| 4     | Validierte Chat-API, SSE, Rate-Limits und Sitzungsschutz                          |
| 5     | Text/FAQ/Dokumente/Webseiten, Worker, Chunking, Embeddings, pgvector-RAG          |
| 6     | Playground, Prompt-Overrides, interne Debug-Daten                                 |
| 7     | Shadow-DOM-Widget, Design-Editor, Domain-Prüfung, Embed-Code                      |
| 8     | Konversationen, Token-/Kostenaufzeichnung, Feedback, Export und Löschung          |
| 9     | Workspace-/Bot-Analytics, Zeiträume, Fragen und Feedback                          |
| 10    | Security-Tests, DB-Integrationstests, Browserprüfung, Build und Dokumentation     |

Während der Umsetzung wurden TypeScript, ESLint, Unit-Tests, Prisma-Schema und Produktionsbuild wiederholt geprüft. Die SQL-Migration wurde auf PostgreSQL mit pgvector angewendet. Die ausführbaren Testbefehle stehen im README. Die Integrationstests ersetzen externe AI-Antworten gezielt durch einen Testadapter; reale Netzverfügbarkeit, Provider-Modellzugang und Abrechnung sind separat mit eigenen Zugangsdaten zu prüfen.

## Referenzen

- [Next.js App Router – Installation](https://nextjs.org/docs/app/getting-started/installation)
- [Prisma – PostgreSQL-Erweiterungen und pgvector](https://docs.prisma.io/docs/postgres/database/postgres-extensions)
- [OpenAI – Chat Completions und Streaming-Usage](https://platform.openai.com/docs/api-reference/chat/create)

Die Implementierung ist durch `package-lock.json` reproduzierbar. Prisma 6 wird mit einem expliziten aktualisierten `deepmerge-ts`-Override verwendet; Schema, Migration und Client-Erzeugung sind damit geprüft. npm 10 erhält `legacy-peer-deps` für die optionalen Vitest-Browser-Adapter; der Node-Test-Runner und Playwright werden unabhängig ausgeführt.
