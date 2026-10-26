"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle, Lock, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("test@gmail.com");
  const [password, setPassword] = React.useState("Start123!!!");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "E-Mail oder Passwort ist nicht korrekt.");
      }

      setSuccessMessage("Erfolgreich angemeldet! Weiterleitung zum Dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Anmeldefehler aufgetreten.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage("Bitte nutze dein hinterlegtes Passwort Start123!!! für test@gmail.com.");
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
            Willkommen zurück
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Melde dich in deinem AI-Workspace an.
          </p>
        </div>

        <Card className="border-slate-200/90 shadow-xl dark:border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Anmeldung</CardTitle>
              <Badge variant="default">Aktiv</Badge>
            </div>
            <CardDescription>
              Gib deine Zugangsdaten ein, um in dein Chatbot-Dashboard zu gelangen.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="leading-relaxed font-medium">{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  E-Mail-Adresse
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
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Passwort
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                  >
                    Passwort vergessen?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Wird angemeldet...
                  </span>
                ) : (
                  "Einloggen"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-center text-xs text-slate-600 dark:text-slate-400">
            <span>Noch kein Konto?</span>
            <Link
              href="/registrieren"
              className="ml-1.5 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Kostenlos registrieren
            </Link>
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-slate-500 bg-slate-100/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
          Gespeicherte Zugangsdaten für dich:<br />
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">test@gmail.com</span> · Passwort: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">Start123!!!</span>
        </div>
      </div>
    </div>
  );
}
