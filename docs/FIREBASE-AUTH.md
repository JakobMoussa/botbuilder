# Benutzeranmeldung mit Firebase

Firebase Authentication übernimmt die Passwörter neuer Accounts. Die App legt
in PostgreSQL eine eindeutige Zuordnung zur Firebase-UID und den persönlichen
Workspace an. Rollen, Bots, Wissensbasis, Gespräche und Sitzungen bleiben in
PostgreSQL. Firebase Authentication allein ersetzt weder PostgreSQL noch den
Node.js-Server oder den Import-Worker.

## Einrichtung

1. In der [Firebase Console](https://console.firebase.google.com/) das Projekt
   öffnen. Unter **Build → Authentication → Jetzt starten** Authentication
   initialisieren, falls noch nicht geschehen.
2. Unter **Sign-in method / Anmeldemethode** **E-Mail/Passwort** einschalten.
   Die Anmeldung per E-Mail-Link wird von dieser App nicht verwendet.
3. Unter **Projekteinstellungen → Allgemein → Deine Apps** eine Web-App anlegen,
   falls noch keine existiert. Den Wert `apiKey` aus der Web-Konfiguration als
   `FIREBASE_WEB_API_KEY` in der privaten Server-`.env` setzen. Dieser Web-Key
   muss zum selben Projekt wie das Firebase-Admin-Servicekonto gehören und
   Anfragen an die Identity Toolkit API erlauben. Browser-Referrer-Beschränkungen
   passen nicht zu diesem serverseitigen Anmeldeablauf.
4. Das Admin-Servicekonto für dasselbe Projekt konfigurieren. In der lokalen
   Docker-Konfiguration wird die bereits vorhandene Schlüsseldatei eingebunden.
   Auf dem Zielserver `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` und
   `FIREBASE_PRIVATE_KEY` als private Umgebungsvariablen setzen. Der Private Key
   kann Zeilenumbrüche als `\n` enthalten. Die Schlüsseldatei bleibt vom
   Upload-Paket und Docker-Image ausgeschlossen.
5. `FIREBASE_AUTH_ENABLED=true` setzen. Für weitere Benutzer nach dem ersten
   Account zusätzlich `ALLOW_REGISTRATION=true` setzen. Die Registrierung ist
   dann für Besucher der App offen; nicht nur für den Eigentümer.
6. `docker compose up -d --build` ausführen. Die Datenbankmigration ergänzt die
   Firebase-UID und den Erstellzeitpunkt von Sitzungen; bestehende Daten bleiben
   erhalten. Bei nativem Betrieb vorher `npm run db:migrate` ausführen.
7. Über `/register` einen Account erstellen und nach dem Abmelden unter `/login`
   wieder anmelden. Das Konto sollte unter **Authentication → Users** erscheinen.
   Ein Konto nur in der Firebase-Konsole anzulegen erzeugt noch keinen Workspace
   in dieser App; neue Benutzer registrieren sich deshalb über `/register`.

## Verhalten und Grenzen

- Neue Firebase-Konten erhalten keinen lokalen Passwort-Hash. Die bestehende
  E-Mail-/Passwort-Oberfläche nutzt serverseitig die Firebase Auth REST API.
  Firebase-Tokens werden geprüft und weder an den Browser weitergegeben noch
  in PostgreSQL gespeichert. Der Browser erhält ein HttpOnly-Session-Cookie.
- Bestehende lokale Accounts funktionieren weiter mit ihrem bisherigen Passwort.
  Sie werden nicht automatisch zu Firebase übertragen. Eine Übereinstimmung
  der E-Mail-Adressen verknüpft niemals zwei Konten oder deren Workspaces.
- Firebase-UID und Datenbankkonto müssen beim Login zusammenpassen. Die
  Sessionprüfung erkennt deaktivierte oder gelöschte Firebase-Accounts und
  widerrufene Sitzungen beim nächsten authentifizierten API-Aufruf. Bei einem
  Firebase-Ausfall bleiben diese Aufrufe geschlossen und melden einen Fehler.
- Der Registrierungsschalter wird auf dem Server geprüft, einschließlich des
  gleichzeitigen Versuchs mehrerer erster Registrierungen. Wenn die lokale
  Speicherung fehlschlägt, wird das gerade erstellte Firebase-Konto gelöscht.
  Scheitert auch diese Bereinigung, meldet das Serverlog ein nicht zugeordnetes
  Konto; dieses in Firebase prüfen und vor einer erneuten Registrierung entfernen.
- Firebase-Benutzerverwaltung ist in der Firebase-Konsole verfügbar. Google-Login,
  Passwort-Reset-Oberfläche, E-Mail-Verifizierung, automatische Migration alter
  Accounts und eine eigene Benutzer-Administrationsoberfläche sind nicht Teil
  dieses Ausbaus.

`GET /api/auth/status` zeigt `authProvider` und `firebaseReady` an.
`firebaseReady` prüft nur, ob die benötigte Serverkonfiguration vorhanden ist;
erst ein erfolgreicher Login bestätigt die Verbindung und aktivierte Methode.

Referenzen: [Firebase Auth REST API](https://firebase.google.com/docs/reference/rest/auth),
[Admin-Benutzerverwaltung](https://firebase.google.com/docs/auth/admin/manage-users),
[Widerruf von Sitzungen](https://firebase.google.com/docs/auth/admin/manage-sessions).
