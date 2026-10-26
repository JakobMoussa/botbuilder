# Dialogue auf den Server laden

Dieses Paket ist für einen Server/VPS mit Docker Compose gedacht. Reiner
PHP-/HTML-Webspace reicht nicht: Die App braucht Node.js, PostgreSQL mit pgvector
und einen dauerhaft laufenden Worker. Docker startet diese Dienste gemeinsam.
Bei einem Node.js-Webspace muss der Anbieter auch PostgreSQL/pgvector und den
Worker unterstützen; dessen Startkonfiguration hängt vom Anbieter ab.

## Welche Dateien hochladen?

Lokal `npm run package:upload` ausführen. Danach ausschließlich
`upload/dialogue-upload.zip` auf den Server übertragen und entpacken. Alternativ
den gesamten Inhalt von `upload/dialogue/` übertragen, **inklusive versteckter
Dateien** wie `.npmrc`, `.dockerignore` und `.env.example`.

Der Upload-Ordner enthält:

- `src/`, `prisma/` einschließlich aller Migrationen, `public/chatbot.js`
- `scripts/boot.mjs`, `scripts/extract-file.ts`
- `package.json`, `package-lock.json`, `.npmrc`
- `next.config.ts`, `next-env.d.ts`, `tsconfig.json`, `postcss.config.mjs`
- `Dockerfile`, `.dockerignore`, die Serverversion von `docker-compose.yml`
- `.env.example` als leere Servervorlage und diese `UPLOAD.md`

Das Paket wird aus einer festen Dateiauswahl erstellt. Lokale `.env`-Dateien,
API-Keys, Firebase-Service-Account-Dateien, Zertifikatsschlüssel, `node_modules/`,
`.next/`, Testergebnisse, Tests, Editor-Dateien, Dumps und Backups werden nicht
übernommen. `.gitignore` schützt Git, `.dockerignore` den Docker-Build-Kontext;
**beide steuern keinen FTP-Upload**. `.uploadignore` ist eine zusätzliche
Ausschlussliste für Transferprogramme, die solche Listen unterstützen.

## Neue Serverinstallation

1. Das Paket in ein privates Anwendungsverzeichnis entpacken, etwa
   `/opt/dialogue`. Nicht als öffentlich herunterladbare Dateien unter
   `public_html`, `htdocs` oder `www` ablegen. Der Webserver leitet später an
   den Node.js-Dienst weiter.
2. Im entpackten Ordner `cp .env.example .env` ausführen und `.env` bearbeiten.
   `APP_URL` auf die echte HTTPS-Adresse setzen, z. B.
   `https://chat.example.com`. Für `POSTGRES_PASSWORD` einen neuen Wert mit
   `openssl rand -hex 32` erzeugen. Anschließend `chmod 600 .env` ausführen.
3. `docker compose up -d --build` starten. Die Migration läuft automatisch;
   App und Worker starten danach. Mit `docker compose ps` und
   `docker compose logs --tail=50 web worker init` prüfen.
4. Domain/DNS und HTTPS-Reverse-Proxy auf `127.0.0.1:3000` einrichten.
   SSE-Buffering deaktivieren, Uploads bis 6 MB erlauben und längere
   Chat-Antworten nicht durch kurze Proxy-Timeouts abbrechen.
5. Vor der allgemeinen Freigabe deinen ersten Account erstellen. Danach
   bleibt die Registrierung weiterer Accounts standardmäßig geschlossen.
6. Dashboard über die HTTPS-Domain öffnen, Website-Domains unter „Einbinden“
   freigeben, Bot aktivieren und den Embed-Code erneut kopieren. Erst dann
   enthält das Snippet die öffentliche Adresse statt `localhost`.

Firebase-Cloud-Backups sind optional. Zugangsdaten dafür separat in der
Serverumgebung hinterlegen; der lokale Firebase-Schlüssel ist nicht im Paket.
AI-Provider lassen sich nach der Anmeldung in den Einstellungen verbinden.

Für Benutzerkonten mit Firebase Authentication siehe `FIREBASE-AUTH.md` im Paket.
`FIREBASE_AUTH_ENABLED=true`, der Web-API-Key und Admin-Zugangsdaten sind dafür
erforderlich. E-Mail/Passwort muss im Firebase-Projekt aktiviert sein. Bestehende
lokale Konten bleiben nutzbar. Die App benötigt weiterhin PostgreSQL und den Worker.

## Bestehende Daten und spätere Updates

Das Upload-Paket enthält **keine bestehenden Accounts, Bots oder Wissensdaten**.
Für einen Umzug müssen die PostgreSQL-Datenbank und die zugehörigen
Verschlüsselungsschlüssel gemeinsam separat übertragen werden. Neue Schlüssel
können vorhandene verschlüsselte Provider-Zugangsdaten nicht entschlüsseln.

Bei Updates die vorhandene Server-`.env`, Datenbank und Docker-Volumes behalten,
den Anwendungscode ersetzen und erneut `docker compose up -d --build` ausführen.
Nicht `docker compose down -v` verwenden: Das würde Daten und Schlüssel löschen.
