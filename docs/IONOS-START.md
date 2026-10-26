# Deine nächsten Schritte mit IONOS Webhosting

Deine normale Website kann auf IONOS Webhosting bleiben. Die aktuelle
Chatbot-Anwendung braucht einen separaten Node.js-Dienst, PostgreSQL mit
pgvector und einen dauerhaft laufenden Import-Worker. Ein FTP-Upload auf
Webhosting startet diese Dienste nicht. Firebase Authentication kümmert sich
nur um Benutzerkonten und ersetzt die Bot-Dienste nicht.

## 1. Einen passenden App-Server bereitstellen

Nutze einen Linux-VPS/Cloud-Server mit Docker Compose, zum Beispiel bei IONOS.
Du benötigst SSH-/Administratorzugriff. Das ist ein zusätzliches Serverprodukt,
kein bloßer Upload-Ordner deines bestehenden Webhostings. Das vorhandene
Projekt enthält bereits die Compose-Konfiguration für App, Datenbank und Worker.
Auf diesem Server müssen Docker und Docker Compose eingerichtet sein.

## 2. Eine Subdomain verbinden

Lege bei IONOS einen A-Record für `chat` an, der auf die öffentliche IPv4-Adresse
des neuen Servers zeigt. Das ergibt zum Beispiel `chat.deine-domain.de`.
Die DNS-Einträge deiner bisherigen Website und E-Mail bleiben unverändert.
Richte für diese Subdomain einen HTTPS-Reverse-Proxy auf `127.0.0.1:3000` ein.
Für eingehenden Webverkehr müssen Port 80/443 in der Server-Firewall offen sein.
Die Datenbank benötigt keinen öffentlichen Port.

IONOS-Anleitung: [A-/AAAA-Record bearbeiten](https://www.ionos.de/hilfe/domains/ip-adresse-konfigurieren/domain-mit-statischer-ip-adresse-verbinden).

## 3. Das vorbereitete Paket installieren

`npm run package:upload` erzeugt das aktuelle `upload/dialogue-upload.zip`.
Dieses Paket auf den **neuen Server** laden und privat, z. B. unter `/opt/dialogue`,
entpacken. Im entpackten Verzeichnis:

```sh
cp .env.example .env
chmod 600 .env
# Neuen Datenbank-Schlüssel erzeugen; den Wert in .env übernehmen:
openssl rand -hex 32
```

In `.env` die tatsächliche `APP_URL=https://chat.deine-domain.de` und den
generierten Wert für `POSTGRES_PASSWORD` setzen. Danach:

```sh
docker compose up -d --build
docker compose ps
```

Die Datenbankmigration läuft automatisch; App und Worker starten anschließend.
Details zu HTTPS, vorhandenen Daten und Updates stehen in `UPLOAD.md` im Paket.
Vor der öffentlichen Freigabe den ersten Account anlegen.

## 4. Firebase-Benutzer aktivieren

Im vorhandenen Firebase-Projekt Authentication initialisieren und
**E-Mail/Passwort** aktivieren. Den Web-API-Key und das Admin-Servicekonto in der
privaten Server-Konfiguration hinterlegen. `FIREBASE_AUTH_ENABLED=true` setzen
und die Container erneut mit `docker compose up -d` starten. Für weitere
Registrierungen `ALLOW_REGISTRATION=true` setzen, wenn diese öffentlich möglich
sein sollen. Siehe `FIREBASE-AUTH.md` im Paket für die genauen Schritte.

## 5. Bots konfigurieren und einbinden

Dashboard unter der HTTPS-Subdomain öffnen. AI-Provider/API-Key verbinden,
Bot erstellen, Wissen hinzufügen und auf „Bereit“ warten. Unter „Einbinden“
die Domain deiner IONOS-Website freigeben, den Bot aktivieren und den neuen
Code in die Website einfügen. Das Snippet verweist dann auf die öffentliche
Chatbot-Subdomain, nicht mehr auf `localhost`.

Die erste Installation enthält keine lokalen Accounts, Bots oder Wissensdaten.
Sollen vorhandene Daten mit umziehen, PostgreSQL-Daten und den passenden
Verschlüsselungsschlüssel gemeinsam separat übertragen.
