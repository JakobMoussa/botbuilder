"use client";

import Link from "next/link";
import { ArrowRight, Bot, Sparkles, ShieldCheck, Zap, Layers, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[120px] -z-10 pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-sm dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300 mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>KI-Plattform für zukunftsorientierte Unternehmen & Agenturen</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white leading-[1.12]">
            KI-Assistenten für{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Website, Social Media
            </span>{" "}
            und Automatisierungen.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Verwalte Website-Chatbots, Social-Media-Kanäle und KI-gestützte Workflows zentral auf einer Plattform. Schnell eingerichtet, flexibel anpassbar und skalierbar.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/registrieren" className="w-full sm:w-auto">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto gap-2 text-base">
                Kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/preise" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                Preise ansehen
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Unverbindliche Vorschau · Keine Kreditkarte nötig · Transparente Tarife
          </p>
        </div>

        {/* Visual Product Mockup (UI Preview, no real chatbot execution) */}
        <div className="mt-14 sm:mt-18 relative mx-auto max-w-5xl">
          <div className="relative rounded-2xl border border-slate-200/90 bg-white/95 p-3 sm:p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/90 ring-1 ring-slate-950/5">
            {/* Mockup Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  platform.dialogue-ai.de/assistant-studio
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[11px] py-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Preview Mode
                </Badge>
              </div>
            </div>

            {/* Mockup Body: Two Column Studio Preview */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Studio Left Panel: Configuration */}
              <div className="md:col-span-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 p-4 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Bot-Konfiguration
                  </span>
                  <Badge variant="outline" className="text-[10px]">v1.0</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Aktiver Assistent
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/70 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Lead & Support Bot
                      </div>
                      <div className="text-[11px] text-slate-500">Unternehmens-Website</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Verbundene Wissensbasis
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                      📄 FAQ_Preise_2026.pdf
                    </span>
                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                      🌐 website-crawl (24 Seiten)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Verfügbare Kanäle
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-600 dark:text-slate-400">Website Widget</span>
                    <Badge variant="default" className="text-[10px] py-0">Bereit</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-600 dark:text-slate-400">Instagram DM</span>
                    <Badge variant="planned" className="text-[10px] py-0">Geplant</Badge>
                  </div>
                </div>
              </div>

              {/* Studio Right Panel: Interactive Visual Chat Simulation */}
              <div className="md:col-span-8 flex flex-col justify-between rounded-xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/50 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/70">
                {/* Chat Message Thread */}
                <div className="space-y-3.5 text-left text-xs sm:text-sm">
                  {/* Bot Intro */}
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-slate-100 p-3 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      Hallo! Wie kann ich dir heute weiterhelfen? Ich beantworte Fragen zu Leistungen, Preisen und Integrationen.
                    </div>
                  </div>

                  {/* User Question */}
                  <div className="flex items-start justify-end gap-2.5 ml-auto max-w-[85%]">
                    <div className="rounded-2xl rounded-tr-sm bg-indigo-600 p-3 text-white shadow-sm">
                      Können wir den Chatbot auch für unseren Kundensupport auf unserer Website einbinden?
                    </div>
                  </div>

                  {/* Bot Response with Citations */}
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-slate-100 p-3 text-slate-800 dark:bg-slate-800 dark:text-slate-200 space-y-2">
                      <p>
                        Ja, absolut! Du kannst den Assistenten ganz einfach über ein JavaScript-Widget in deine Website einbetten. Er greift direkt auf deine hinterlegten Dokumente zu und qualifiziert Anfragen rund um die Uhr vor.
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span>Quelle: Wissensbasis FAQ · Antwortzeit: 420 ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Input Area */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      placeholder="Stelle eine Testfrage (UI-Vorschau)..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 cursor-not-allowed"
                    />
                  </div>
                  <button
                    disabled
                    aria-label="Senden simulieren"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white opacity-60 cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Advantage Bar (Section 5) */}
        <div className="mt-16 sm:mt-20 border-t border-slate-200/80 dark:border-slate-800/80 pt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
            Die Kernvorteile der Plattform
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Zentrale Verwaltung
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Alle Assistenten, Quellen und Prompts an einem Ort.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Individuelle Assistenten
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Exakt abgestimmte Tonalität und maßgeschneiderte Antworten.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Website & Social Media
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Web-Widget und geplante Anbindung an Meta-Kanäle.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Erweiterbar mit MCP
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Model Context Protocol zur Anbindung von Tools und Workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
