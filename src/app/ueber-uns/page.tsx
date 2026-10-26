import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Bot, Shield, Rocket, ArrowRight, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CTASection } from "@/components/marketing/cta-section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Über uns & Produktvision",
  description:
    "Erfahre mehr über die Mission hinter unserer AI-SaaS-Plattform für Chatbots und Automatisierungen.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-indigo-950/20 dark:via-slate-950 dark:to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-4">
            Unsere Vision & Hintergrund
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Wir machen KI-Assistenten einfach zugänglich
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Unternehmen und Agenturen stehen oft vor der Herausforderung, modernste KI-Modelle praktisch und sicher in ihre täglichen Kundenprozesse zu integrieren. Genau hier setzt unsere Plattform an.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {/* Mission Statement */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <Badge variant="outline">Fokus & Kernkompetenz</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Präzise Antworten statt unkontrollierte Halluzinationen
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Standard-Chatbots antworten oft ungenau oder erfinden Fakten. Unsere Architektur setzt auf Retrieval-Augmented Generation (RAG) und konfigurierbare Schwellenwerte: Wenn keine gesicherte Antwort in deiner hinterlegten Wissensdatenbank vorliegt, wird dies transparent kommuniziert oder an menschliche Ansprechpartner verwiesen.
            </p>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Dadurch gewinnen Unternehmen das Vertrauen, KI tatsächlich im direkten Kundenkontakt auf ihrer Website und in Social-Media-Kanälen einzusetzen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6 border-slate-200/90 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Zielgerichtet</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Spezialisierte Assistenten für Kundensupport, Lead-Erfassung und Mitarbeiterfragen.
              </p>
            </Card>

            <Card className="p-6 border-slate-200/90 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Datenschutz</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Konzipiert nach europäischen Standards und strikter Tenant-Isolation.
              </p>
            </Card>

            <Card className="p-6 border-slate-200/90 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                <Rocket className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Zukunftssicher</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Bereit für Model Context Protocol (MCP) und modulare Tool-Integrationen.
              </p>
            </Card>

            <Card className="p-6 border-slate-200/90 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Agenturfähig</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Entwickelt für Agenturen, die KI-Lösungen für ihre Mandanten skalieren möchten.
              </p>
            </Card>
          </div>
        </section>

        {/* Product Roadmap / Ausblick */}
        <section className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-8 sm:p-12 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="max-w-3xl">
            <Badge variant="planned" className="mb-3">
              Transparente Entwicklung
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Schritt für Schritt zur ganzheitlichen KI-Infrastruktur
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Wir versprechen keine Wunderfunktionen, sondern bauen verlässliche, praxiserprobte Komponenten. Die Plattform wird kontinuierlich um geplante Features wie Meta-Messenger-Integrationen, Mehrmandanten-Rollen und MCP-Workflow-Konnektoren erweitert.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/leistungen">
                <Button variant="outline" className="gap-2">
                  Aktuelle Leistungen ansehen
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button variant="default">
                  Mit unserem Team sprechen
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <CTASection />
    </div>
  );
}
