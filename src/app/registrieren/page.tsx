"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, User, Mail, Lock, CheckSquare, Square, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setInfoMessage("Bitte bestätige die Nutzungsbedingungen, um fortzufahren.");
      return;
    }
    if (password !== passwordConfirm) {
      setInfoMessage("Die eingegebenen Passwörter stimmen nicht überein.");
      return;
    }
    setInfoMessage(
      "Hinweis: Die Registrierung wird in einer späteren Version verfügbar sein. Deine Daten wurden zu keinem Zeitpunkt übertragen oder gespeichert."
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25">
              <Sparkles className="h-5 w-5" />
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Konto erstellen
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Starte unverbindlich mit deiner KI-Plattform.
          </p>
        </div>

        <Card className="border-slate-200/90 shadow-xl dark:border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Kostenlose Registrierung</CardTitle>
              <Badge variant="planned">UI Vorschau</Badge>
            </div>
            <CardDescription>
              Fülle die Felder aus, um deinen Workspace vorzubereiten.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {infoMessage && (
              <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                <div className="leading-relaxed">{infoMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Vollständiger Name
                </label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Max Mustermann"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Geschäftliche E-Mail-Adresse
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@unternehmen.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Passwort
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mindestens 8 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="passwordConfirm"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="Passwort wiederholen"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1 flex items-start gap-2.5 text-left">
                <button
                  type="button"
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className="mt-0.5 text-indigo-600 focus:outline-none cursor-pointer"
                  aria-checked={acceptedTerms}
                  role="checkbox"
                >
                  {acceptedTerms ? (
                    <CheckSquare className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                <label
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none leading-relaxed"
                >
                  Ich akzeptiere die{" "}
                  <Link href="/agb" className="text-indigo-600 hover:underline">
                    AGB
                  </Link>{" "}
                  und habe die{" "}
                  <Link href="/datenschutz" className="text-indigo-600 hover:underline">
                    Datenschutzerklärung
                  </Link>{" "}
                  zur Kenntnis genommen.
                </label>
              </div>

              <Button type="submit" variant="gradient" className="w-full mt-2">
                Konto erstellen
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-center text-xs text-slate-600 dark:text-slate-400">
            <span>Bereits registriert?</span>
            <Link
              href="/login"
              className="ml-1.5 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Hier anmelden
            </Link>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Hinweis: UI-Platzhalter. Keine Live-Authentifizierung oder Datenbank-Persistenz im Gange.
        </p>
      </div>
    </div>
  );
}
