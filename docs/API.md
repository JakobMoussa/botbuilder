# API

Alle administrativen Routen benötigen das HttpOnly-Cookie `dialogue_session`. Bei POST/PATCH/PUT/DELETE ist zusätzlich `Origin: <APP_URL>` erforderlich. JSON-Anfragen nutzen `Content-Type: application/json`. Fehler haben die Form `{ "error": "…" }` und einen passenden HTTP-Status. Admin-Daten werden nicht gecacht.

| Methode            | Route                                                    | Funktion                                                                           |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| GET                | `/api/health`                                            | DB-Verbindung prüfen                                                               |
| GET                | `/api/auth/status`                                       | Registrierung offen?                                                               |
| POST               | `/api/auth/register`                                     | `{name, workspace, email, password}`; Passwort mindestens 12 Zeichen               |
| POST               | `/api/auth/login`                                        | `{email, password}`                                                                |
| GET                | `/api/auth/me`                                           | Aktueller User/Workspace, keine Passwortdaten                                      |
| POST               | `/api/auth/logout`                                       | Session löschen                                                                    |
| GET/POST/PATCH/PUT | `/api/workspace`                                         | Eigene Workspaces / erstellen / umbenennen / aktiven Workspace wechseln            |
| GET/POST           | `/api/providers`                                         | Metadaten lesen / `{name, baseUrl, apiKey}` validieren und verschlüsselt speichern |
| GET                | `/api/providers/:id/models`                              | Modelle des Workspace-Providers laden; `environment` für Server-Key                |
| DELETE             | `/api/providers/:id`                                     | Unbenutzten Provider entfernen                                                     |
| GET/POST           | `/api/bots`                                              | Eigene Bots auflisten / `{name, description}` erstellen                            |
| GET/PATCH/DELETE   | `/api/bots/:id`                                          | Bot lesen / ändern / inklusive abhängiger Daten löschen                            |
| POST               | `/api/bots/:id/duplicate`                                | Einstellungen und Quellen als neuen inaktiven Bot kopieren                         |
| GET/POST           | `/api/bots/:id/knowledge`                                | Quellenstatus / Quelle hinzufügen                                                  |
| DELETE             | `/api/bots/:id/knowledge/:sourceId`                      | Quelle samt Chunks löschen                                                         |
| POST               | `/api/bots/:id/reindex`                                  | `{sourceId?}`; alle oder eine Quelle einplanen                                     |
| GET                | `/api/bots/:id/conversations`                            | Neueste 100 Gespräche                                                              |
| GET/DELETE         | `/api/bots/:id/conversations/:conversationId`            | Einzelnes Gespräch lesen/löschen                                                   |
| DELETE             | `/api/bots/:id/conversations`                            | Alle Gespräche des Bots löschen                                                    |
| GET                | `/api/bots/:id/export`                                   | Vollständiger Gesprächsexport als JSON                                             |
| GET                | `/api/bots/:id/analytics`                                | Zeitraumbezogene Analytics                                                         |
| GET                | `/api/knowledge`, `/api/conversations`, `/api/analytics` | Workspaceweite Ansichten                                                           |
| GET                | `/api/audit`                                             | Letzte 100 Verwaltungsaktionen                                                     |
| POST               | `/api/playground`                                        | Authentifizierter Preview-Chat mit optionalen Settings und Debug                   |

## Bot-Patch

```json
{
  "name": "Website-Assistent",
  "description": "Interner Hinweis",
  "active": true,
  "domains": ["example.com", "www.example.com"],
  "settings": {
    "providerId": "PROVIDER_ID",
    "model": "gpt-4o-mini",
    "temperature": 0.3,
    "maxTokens": 1000,
    "storeConversations": true,
    "analyticsEnabled": true,
    "retentionDays": 30
  },
  "widget": {
    "displayName": "Website-Assistent",
    "primaryColor": "#7360df",
    "position": "right",
    "theme": "light",
    "branding": true
  }
}
```

Felder sind optional. Die vollständigen Grenzen definiert `src/lib/validation.ts`. Fremde Provider-IDs werden abgewiesen. Eine Aktivierung benötigt mindestens eine freigegebene Domain.

## Wissensquelle

Manueller Text/FAQ: `{ "name": "Leistungen", "type": "TEXT", "content": "…" }`. `FAQ` speichert Frage und Antwort gemeinsam als Text. Eine Website verwendet `{ "name": "Website", "type": "URL", "url": "https://example.com" }`; `CRAWL` importiert bis zu 20 Seiten.

Dateien über `multipart/form-data` mit dem Feld `file` hochladen. Status: `QUEUED` → `PROCESSING` → `READY` oder `ERROR`. Der Worker beansprucht Jobs atomar; unterbrochene Jobs werden nach 15 Minuten beim nächsten Wartungslauf als Fehler markiert. Neuindexierung ist explizit wiederholbar. Es gibt keine automatischen kostenpflichtigen Provider-Retry-Schleifen.

## Öffentliche APIs

| Methode | Route                             | Funktion                                                |
| ------- | --------------------------------- | ------------------------------------------------------- |
| GET     | `/chatbot.js`                     | Unabhängiges Widget-Script                              |
| GET     | `/widget/:publicBotId/config`     | Nur freigegebene Widget-Felder                          |
| GET     | `/api/public/config/:publicBotId` | Alternative Konfigurationsroute                         |
| POST    | `/api/public/chat`                | `{botId, message, sessionToken?, conversationId?}`      |
| POST    | `/api/public/feedback`            | `{botId, sessionToken, messageId, feedback: 1 oder -1}` |

Öffentliche Requests benötigen einen exakten freigegebenen Origin und einen aktiven Bot. `botId` ist hier die öffentliche UUID, während Admin-APIs die interne ID verwenden. Debug und überschreibbare Settings sind ausschließlich im authentifizierten Playground verfügbar. Nachrichten sind auf 4.000 Zeichen begrenzt.

## SSE-Format

```text
data: {"type":"meta","sessionToken":"64_HEX_ZEICHEN","conversationId":"UUID"}

data: {"type":"delta","text":"Hallo"}

data: {"type":"done","messageId":"NACHRICHT_ID"}

```

Bei deaktivierter Speicherung fehlen `conversationId` und `messageId`. Clients müssen den vom Server erzeugten `sessionToken` für Folgefragen mitsenden; eine Gesprächs-ID allein berechtigt nicht zum Lesen des Verlaufs. Ein Streamfehler liefert `{type:"error", message:"…"}`. Clients sollen außerdem ein Verbindungsende ohne `done` als Unterbrechung behandeln.

Playground-`done` enthält zusätzlich `debug` mit `model`, `chunks`, `context`, `inputTokens`, `outputTokens`, `embeddingTokens`, `estimated`, `cost`, `latencyMs`.

## Analytics

Query `?days=1|7|30|90`, alternativ `?from=2026-10-01&to=2026-10-31`. Maximal 366 Tage. Tagesaggregation erfolgt in UTC. Felder: Gespräche, gespeicherte Nachrichten, eindeutige Session-Hashes, Tokens einschließlich Abfrage-Embeddings, geschätzte Kosten, durchschnittliche Laufzeit, Tagesreihe, häufige Fragen und Feedback. Ohne Speicherung stehen keine gespeicherten Fragen/Sessions zur Verfügung. `series.messages` entspricht zweimal der Zahl erfolgreicher Chat-Anfragen; abgelehnte Anfragen zählen nicht.

## Limits

DB-gestützte feste Zeitfenster: 10 Login-/Registrierungsversuche pro 10 Minuten und IP-Bucket, 300 Admin-Anfragen/Minute/User, 60 Chat-Anfragen/Minute/Bot/IP-Bucket, 15/Minute/Bot/Session, konfigurierbares tägliches Bot-Limit, 30 neue Quellen/Stunde/Bot. HTTP 429 signalisiert das Erreichen eines Limits. Ein IP-Bucket setzt entweder einen ausdrücklich vertrauenswürdigen Proxy voraus oder wird für alle direkten Clients gemeinsam genutzt.
