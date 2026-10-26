import Link from "next/link";
import {
  Bot,
  MessageSquare,
  Cpu,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Workflow,
  Globe,
} from "lucide-react";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureCard } from "@/components/marketing/feature-card";
import { CTASection } from "@/components/marketing/cta-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section & Advantage Bar */}
      <HeroSection />

      {/* 2. Services / Feature Overview */}
      <section className="py-20 sm:py-28 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-4">
              Vier Kernbereiche
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
              Leistungsstarke KI-Lösungen für dein Unternehmen
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Von der einfachen Website-Integration bis hin zu anspruchsvollen Automatisierungen und schlüsselfertiger Betreuung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Website Chatbots */}
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Website-Chatbots"
              badge={{ text: "Kernmodul", variant: "default" }}
              description="Intelligente KI-Assistenten für deine Unternehmenswebsite, die Kundenfragen blitzschnell und präzise beantworten."
              points={[
                "Beantwortung häufiger Fragen auf Basis deiner hochgeladenen Dokumente & FAQs",
                "Vorqualifizierung von Leads und Interessenten rund um die Uhr",
                "Einbindung per JavaScript-Widget (als geplante Kernfunktion)",
                "Anpassbares Design passend zu deiner Markenidentität",
              ]}
              ctaText="Details zu Website-Chatbots"
              ctaHref="/leistungen#website-chatbots"
              highlighted={true}
            />

            {/* 2. Social-Media-Chatbots */}
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Social-Media-Chatbots"
              badge={{ text: "In Vorbereitung", variant: "planned" }}
              description="Direkte Kundenkommunikation über die beliebtesten Messaging-Kanäle. Schnell, automatisiert und sympathisch."
              points={[
                "Geplante Anbindung an Instagram Direct Messages und Facebook Messenger",
                "Zentrale Verwaltung aller eingehenden Kundenanfragen in einem Posteingang",
                "Automatisierte Antworten auf Öffnungszeiten, Preise und Standardanliegen",
                "Verfügbarkeit abhängig von Meta-API-Zugriffen und Berechtigungen",
              ]}
              ctaText="Details zu Social-Media-Kanälen"
              ctaHref="/leistungen#social-media"
            />

            {/* 3. MCP-Tools & Automatisierungen */}
            <FeatureCard
              icon={<Workflow className="h-6 w-6" />}
              title="MCP-Tools & Automatisierung"
              badge={{ text: "Zukunftssicher", variant: "planned" }}
              description="Verbinde KI mit deinen realen Geschäftssystemen über das moderne Model Context Protocol (MCP)."
              points={[
                "Geplante Anbindung an CRMs, Kalender, Ticket-Systeme und interne Datenbanken",
                "Sichere Ausführung von vordefinierten Aktionen durch autorisierte KI-Agenten",
                "Keine manuelle Datenübertragung mehr zwischen isolierten Insellösungen",
                "Integrationsschnittstellen werden bedarfsgerecht freigeschaltet",
              ]}
              ctaText="Details zu MCP & Tools"
              ctaHref="/leistungen#mcp-tools"
            />

            {/* 4. Managed Service */}
            <FeatureCard
              icon={<Headphones className="h-6 w-6" />}
              title="Managed Service"
              badge={{ text: "Rundum-Sorglos", variant: "success" }}
              description="Konfiguration, Setup und laufende Optimierung durch unser Expertenteam. Für Unternehmen ohne eigene KI-Ressourcen."
              points={[
                "Individuelle Konfiguration des Chatbots & Aufbereitung der Wissensbasis",
                "Laufende Überwachung, Qualitätsprüfungen und Nachjustierung von Prompts",
                "Persönlicher Support und regelmäßige Updates bei neuen Modellversionen",
                "Ideal für Unternehmen, die maximale Ergebnisse ohne internen Aufwand wollen",
              ]}
              ctaText="Managed Service entdecken"
              ctaHref="/preise#managed-service"
            />
          </div>

          <div className="mt-12 text-center">
            <Link href="/leistungen">
              <Button variant="outline" size="lg" className="gap-2 font-semibold">
                Alle Leistungen im Detail ansehen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. How it Works (3 Steps) */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3">
              Geplanter Ablauf
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              In drei Schritten zur KI-Lösung
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              So einfach und strukturiert wird dein maßgeschneiderter KI-Assistent startklar gemacht.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg mb-6 shadow-md shadow-indigo-600/20">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Tarif oder Leistung auswählen
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Wähle den passenden Self-Service-Plan für dein Team oder entscheide dich für das schlüsselfertige Managed-Service-Paket.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-lg mb-6 shadow-md shadow-purple-600/20">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Anforderungen & Inhalte festlegen
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Definiere Tonalität, Einsatzbereiche und lade deine Wissensdokumente (FAQs, PDFs, Website-Links) hoch.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg mb-6 shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                KI einrichten & nutzen
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Bette das Chatbot-Widget per Code-Snippet in deine Website ein oder aktiviere die freigegebenen Kanäle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <CTASection />
    </div>
  );
}
