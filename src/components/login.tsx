"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api, write } from "@/lib/client";
import { Button, Field } from "./ui";
import { ThemeToggle } from "./theme-toggle";
export function Login({ onLogin, mode }: { onLogin: () => void; mode?: "login" | "register" }) {
  const [register, setRegister] = useState(mode === "register"),
    [registrationOpen, setRegistrationOpen] = useState(false),
    [firebase, setFirebase] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    api<{ registrationOpen: boolean; authProvider?: string }>("auth/status")
      .then((x) => {
        setRegistrationOpen(x.registrationOpen);
        setFirebase(x.authProvider === "firebase");
        setRegister(mode === "login" ? false : x.registrationOpen);
      })
      .catch((e) => setError(e.message));
  }, [mode]);
  return (
    <main className="login">
      <section className="login-story">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={23} />
          </span>
          dialogue<span className="brand-dot">.</span>
        </Link>
        <div className="login-pitch">
          <div className="eyebrow">DEIN WISSEN. IM DIALOG.</div>
          <h1>
            Gute Gespräche
            <br />
            beginnen mit
            <br />
            <em>deinem Wissen.</em>
          </h1>
          <p>
            Verwandle deine Website in einen persönlichen Dialog. Mit
            KI-Assistenten, die dein Unternehmen verstehen.
          </p>
          <div className="login-illustration">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-center">
              <Bot size={48} strokeWidth={1.5} />
            </div>
            <span className="float-card float-one">
              <Globe2 size={17} /> Deine Website
            </span>
            <span className="float-card float-two">
              <Check size={16} /> Die passende Antwort
            </span>
            <span className="float-spark">
              <Sparkles size={25} />
            </span>
          </div>
        </div>
        <div className="login-footer">
          <ShieldCheck size={17} />
          {firebase ? "Dein Workspace. Deine Assistenten." : "Self-hosted. Deine Daten bleiben in deiner Hand."}
        </div>
      </section>
      <section className="login-form">
        <div className="login-theme"><ThemeToggle /></div>
        <div className="login-form-inner">
          <span className="eyebrow">DEIN AI WORKSPACE</span>
          <nav className="auth-tabs" aria-label="Account-Zugang">
            <Link href="/login" aria-current={!register ? "page" : undefined}>Anmelden</Link>
            {registrationOpen && <Link href="/register" aria-current={register ? "page" : undefined}>Account erstellen</Link>}
          </nav>
          <h2>
            {register ? "Raum für gute Gespräche." : "Willkommen zurück."}
          </h2>
          <p>
            {register
              ? "Erstelle deinen ersten Workspace und bring deinen Assistenten zum Leben."
              : "Melde dich an und gestalte den nächsten Dialog."}
          </p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              const form = new FormData(event.currentTarget);
              try {
                await write(
                  `auth/${register ? "register" : "login"}`,
                  Object.fromEntries(form),
                );
                onLogin();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {register && (
              <div className="form-row">
                <Field label="Dein Name">
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    placeholder="Alex Weber"
                  />
                </Field>
                <Field label="Workspace">
                  <input
                    name="workspace"
                    required
                    minLength={2}
                    placeholder="Mein Studio"
                  />
                </Field>
              </div>
            )}
            <Field label="E-Mail-Adresse">
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="du@unternehmen.de"
              />
            </Field>
            <Field
              label="Passwort"
              hint={register ? "Mindestens 12 Zeichen." : undefined}
            >
              <input
                name="password"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                minLength={register ? 12 : undefined}
                required
                placeholder="Dein sicheres Passwort"
              />
            </Field>
            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}
            <Button busy={busy} type="submit" className="full">
              {register ? "Workspace erstellen" : "Anmelden"}
              <ArrowRight size={17} />
            </Button>
          </form>
          {registrationOpen && (
            <Link
              href={register ? "/login" : "/register"}
              className="text-button login-switch"
            >
              {register
                ? "Schon einen Account? Anmelden"
                : "Neuen Workspace registrieren"}
            </Link>
          )}
          <div className="login-trust">
            <ShieldCheck size={15} />
            <span>{firebase ? "Benutzeranmeldung mit Firebase Authentication." : "Sicher auf deiner eigenen Infrastruktur."}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
