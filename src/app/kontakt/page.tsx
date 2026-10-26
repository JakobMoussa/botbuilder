"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [service, setService] = React.useState("self-service");
  const [message, setMessage] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-indigo-950/20 dark:via-slate-950 dark:to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-4">
            Wir sind für dich da
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Kontakt & unverbindliche Beratung
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Hast du Fragen zu unseren Tarifen, zum Managed Service oder möchtest du eine individuelle Demonstration vereinbaren? Schreibe uns direkt.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Information & Notes */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Lass uns sprechen
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Wir antworten in der Regel werktags innerhalb von 24 Stunden.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/90 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500">E-Mail-Kontakt</h4>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    [E-Mail-Adresse wird vor Veröffentlichung hinterlegt]
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/90 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500">Support-Zeiten</h4>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    Montag bis Freitag, 09:00 – 17:00 Uhr (MEZ)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/90 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500">Unternehmenssitz</h4>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    [Firmenadresse wird im Impressum hinterlegt]
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/70 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <strong>Hinweis:</strong> Dies ist eine Vorschau-Website. Bitte sende über dieses Formular keine sensiblen Passwörter oder geschäftskritischen Geheimnisse.
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <Card className="border-slate-200/90 shadow-lg dark:border-slate-800 p-2 sm:p-4">
              <CardHeader>
                <CardTitle>Nachricht senden</CardTitle>
                <CardDescription>
                  Wähle dein Anliegen aus und teile uns deine Kontaktdaten mit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 mb-4">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Vielen Dank für deine Anfrage!
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      In dieser Entwicklungsversion ist noch kein echter E-Mail-Dienst angebunden. Deine Eingabe wurde erfolgreich simuliert.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        setSubmitted(false);
                        setName("");
                        setEmail("");
                        setMessage("");
                      }}
                    >
                      Weitere Nachricht simulieren
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label
                          htmlFor="name"
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          Dein Name *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          required
                          placeholder="z. B. Julia Schneider"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label
                          htmlFor="email"
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          Deine E-Mail *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="julia@beispiel.de"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="service"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Interesse / Themenbereich
                      </label>
                      <select
                        id="service"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="self-service">Self-Service Tarife (Starter / Pro / Agentur)</option>
                        <option value="managed">Managed Service (Einrichtung & Betreuung)</option>
                        <option value="social-media">Social-Media-Anbindung (Instagram/Facebook)</option>
                        <option value="mcp-tools">MCP-Tools & Workflow-Automatisierung</option>
                        <option value="other">Sonstiges Anliegen</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="message"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Deine Nachricht *
                      </label>
                      <Textarea
                        id="message"
                        required
                        placeholder="Wie können wir dir helfen? Beschreibe kurz deine Anforderungen..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <Button type="submit" variant="gradient" className="w-full gap-2 mt-2">
                      <Send className="h-4 w-4" />
                      Nachricht absenden
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
