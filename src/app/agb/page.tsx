import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen (Platzhalter)",
  description: "Nutzungsbedingungen und AGB der Plattform.",
};

export default function AgbPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant="planned">Rechtlicher Platzhalter</Badge>
          <span className="text-xs text-slate-500">Vertragliche Grundlagen</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>

        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Hinweis:</strong> Dieses Dokument dient als Platzhalter für die Benutzeroberfläche. Die endgültigen AGB für B2B-Kunden, Gewährleistungsregeln, Service-Level-Agreements (SLA) und Kündigungsfristen werden vor dem Livegang durch Rechtsberatung finalisiert.
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-6">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              § 1 Geltungsbereich & Vertragsgegenstand
            </h2>
            <p>
              (1) Die nachfolgenden Bedingungen regeln die Nutzung der Plattform für KI-Assistenten und Chatbot-Automatisierungen zwischen dem Anbieter und dem jeweiligen gewerblichen Kunden (B2B).
            </p>
            <p>
              (2) Abweichende Geschäftsbedingungen des Nutzers finden keine Anwendung, es sei denn, ihrer Geltung wurde ausdrücklich schriftlich zugestimmt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              § 2 Bereitstellung von Software & Managed Service
            </h2>
            <p>
              (1) Der Anbieter stellt je nach gewähltem Tarif Speicherplatz, Schnittstellen und KI-Infrastruktur bereit.
            </p>
            <p>
              (2) Bei Managed-Service-Verträgen erbringt der Anbieter Einrichtungs- und Pflegeleistungen gemäß gesonderter Leistungsbeschreibung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              § 3 Tokenkontingente & Fair-Use
            </h2>
            <p>
              (1) Enthaltene Tokenlimits gelten jeweils für den vereinbarten Abrechnungsmonat. Ein Übertrag ungenutzter Einheiten in den Folgemonat ist ausgeschlossen.
            </p>
            <p>
              (2) Für Tarife mit hohem Kontingent gilt eine Fair-Use-Regelung zum Schutz vor missbräuchlicher Überlastung der Schnittstellen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              § 4 Haftung & Verfügbarkeit
            </h2>
            <p>
              (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit. Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten.
            </p>
            <p>
              (2) Für inhaltliche Richtigkeit von KI-generierten Chatbot-Ausgaben übernimmt der Anbieter keine Gewähr, da diese auf Wahrscheinlichkeitsmodellen basieren.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
