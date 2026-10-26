import type { Metadata } from "next";
import Link from "next/link";
import {
  Globe,
  MessageSquare,
  Workflow,
  Headphones,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Leistungen & KI-Lösungen",
  description:
    "Erfahre mehr über Website-Chatbots, geplante Social-Media-Anbindungen, MCP-Automatisierungen und unseren Managed Service.",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Banner */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-indigo-950/20 dark:via-slate-950 dark:to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-4">
            Unsere Leistungen im Überblick
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Moderne KI-Lösungen für maximale Effizienz
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Ob du deinen ersten Website-Assistenten im Self-Service aufbauen oder ein ganzheitliches, schlüsselfertiges Managed-Service-Paket nutzen möchtest – entdecke unsere vier Leistungsbausteine.
          </p>
        </div>
      </section>

      {/* Detailed Services Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        {/* 1. Website Chatbots */}
        <section id="website-chatbots" className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <Badge variant="default">Kernmodul</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    Website-Chatbots
                  </h2>
                </div>
              </div>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Verwandle deine Website in einen interaktiven 24/7-Beratungskanal. Unsere KI-Chatbots beantworten Kundenfragen auf Basis deiner eigenen Wissensdatenbank und helfen dabei, qualifizierte Kontakte vorzubereiten.
              </p>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Konkrete Anwendungsfälle:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Kundenservice & FAQs:</strong> Sofortige Klärung von Rückfragen zu Öffnungszeiten, Produkten, Preisen und Dienstleistungen.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Lead-Vorqualifizierung:</strong> Erfassung der Anforderungen des Besuchers vor Weiterleitung an dein Vertriebsteam.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Einfache Integration:</strong> Geplante Einbindung per leichtgewichtigem JavaScript-Widget mit flexiblen Designeinstellungen.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link href="/preise">
                  <Button variant="default" className="gap-2">
                    Tarife ansehen
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/kontakt">
                  <Button variant="outline">
                    Frage zu Website-Bots
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-indigo-50/50 to-white p-6 shadow-md dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                Wissensquellen & RAG
              </h4>
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                  <span>Dokumenten-Upload (PDF, FAQ, DOCX)</span>
                  <Badge variant="default">Unterstützt</Badge>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                  <span>Domain- & Sitemap-Crawl</span>
                  <Badge variant="default">Unterstützt</Badge>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                  <span>JavaScript-Widget Snippet</span>
                  <Badge variant="planned">Geplante Funktion</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Social Media Chatbots */}
        <section id="social-media" className="scroll-mt-24 border-t border-slate-200/60 dark:border-slate-800/60 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <Badge variant="planned">In Vorbereitung</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    Social-Media-Chatbots
                  </h2>
                </div>
              </div>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Antworte deinen Kunden dort, wo sie sich ohnehin aufhalten. Die geplante Integration für Instagram Direct Messages und Facebook Messenger ermöglicht es, Kundenanfragen direkt im Chatkanal automatisiert zu beantworten.
              </p>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Konkrete Anwendungsfälle:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Schnellantworten auf Instagram DMs:</strong> Potenzielle Kunden fragen oft nach Preisen, Terminen oder Verfügbarkeiten direkt per Nachricht.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Zentraler Posteingang:</strong> Verwaltung unterschiedlicher Kanäle über eine gemeinsame Administrationsoberfläche.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Konsistente Markenstimme:</strong> Gleiches Faktenwissen und dieselbe Tonalität auf Website und Social Media.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>
                  <strong>Transparenzhinweis:</strong> Die tatsächliche Freischaltung von Instagram- und Facebook-Funktionen hängt von individuellen Meta-API-Freigaben und App-Berechtigungen ab und ist derzeit als zukünftige Erweiterung konzipiert.
                </span>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link href="/preise">
                  <Button variant="outline" className="gap-2">
                    Tarife ansehen
                  </Button>
                </Link>
                <Link href="/kontakt?interesse=social-media">
                  <Button variant="default">
                    Vorab-Interesse anmelden
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                Status der Kanal-Anbindungen
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span>Instagram Direct</span>
                  <Badge variant="planned">Geplant (Meta Review)</Badge>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span>Facebook Messenger</span>
                  <Badge variant="planned">Geplant (Meta Review)</Badge>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span>WhatsApp Business API</span>
                  <Badge variant="secondary">In Evaluierung</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. MCP-Tools und Automatisierungen */}
        <section id="mcp-tools" className="scroll-mt-24 border-t border-slate-200/60 dark:border-slate-800/60 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <Workflow className="h-6 w-6" />
                </div>
                <div>
                  <Badge variant="planned">Geplante Anbindung</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    MCP-Tools & Automatisierungen
                  </h2>
                </div>
              </div>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Das <strong>Model Context Protocol (MCP)</strong> ist der zukunftssichere Standard, um KI-Modelle mit autorisierten Drittsystemen zu koppeln. Anstatt nur Text zu generieren, soll die KI in der Lage sein, strukturierte Aktionen in deinen Tools auszuführen.
              </p>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Geplante Anwendungsfälle:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>CRM-Synchronisation:</strong> Qualifizierte Interessenten werden automatisch als Lead in dein CRM eingetragen.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Terminkalender-Abgleich:</strong> Automatisiertes Finden freier Slots und Buchung von Erstgesprächen.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>Ticket-System-Übergabe:</strong> Komplexe Supportanfragen können als Ticket an das Serviceteam übergeben werden.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link href="/kontakt?thema=mcp-tools">
                  <Button variant="default">
                    Automatisierungs-Bedarf anfragen
                  </Button>
                </Link>
                <Link href="/preise">
                  <Button variant="outline">
                    Tarife ansehen
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                Architektur: Model Context Protocol
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Keine isolierten Skripte, sondern sichere standardisierte Schnittstellen mit strikter Autorisierung.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  CRM Adapter (HubSpot / Pipedrive)
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Calendar Adapter (Cal.com / Google)
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Custom Webhook Bridge
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Managed Service */}
        <section id="managed-service" className="scroll-mt-24 border-t border-slate-200/60 dark:border-slate-800/60 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <Badge variant="success">Rundum-Sorglos-Betreuung</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    Managed Service – Setup & Betreuung
                  </h2>
                </div>
              </div>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Du möchtest dich nicht mit Prompts, Embedding-Scores, Parsing-Regeln oder Wissens-Updates beschäftigen? Unser erfahrenes Team übernimmt Konfiguration, Aufbereitung deiner Unternehmensdokumente und die laufende Betreuung.
              </p>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Was der Managed Service beinhaltet:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Einrichtung & Prompt-Engineering:</strong> Professionelles Design der System-Prompts für perfekte Tonalität.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Wissenspflege:</strong> Regelmäßiges Einpflegen neuer Angebote, Produktänderungen und FAQ-Aktualisierungen.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Laufende Überwachung:</strong> Erkennung von Wissenslücken und kontinuierliche Optimierung der Antworten.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link href="/preise#managed-service">
                  <Button variant="gradient" className="gap-2">
                    Managed Service Tarife ansehen
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/kontakt?service=managed">
                  <Button variant="outline">
                    Beratungsgespräch anfragen
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                Managed Service Konditionen
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Transparent berechnet, ohne versteckte Überraschungen.
              </p>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950">
                  <div className="font-semibold text-slate-900 dark:text-white">Jährliche Variante</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-0.5">39,99 € / Monat + 99 € Setup</div>
                  <div className="text-[11px] text-slate-500 mt-1">1. Jahr Gesamtkosten: 578,88 € zzgl. USt.</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white">Monatliche Variante</div>
                  <div className="text-slate-700 dark:text-slate-300 font-bold text-sm mt-0.5">49,99 € / Monat + 249 € Setup</div>
                  <div className="text-[11px] text-slate-500 mt-1">1. Jahr Gesamtkosten: 848,88 € zzgl. USt.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA Bottom */}
      <CTASection />
    </div>
  );
}
