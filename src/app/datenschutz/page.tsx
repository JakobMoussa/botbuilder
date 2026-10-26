import type { Metadata } from "next";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Datenschutzerklärung (Platzhalter)",
  description: "Datenschutzhinweise und rechtliche Informationen.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant="planned">Rechtlicher Platzhalter</Badge>
          <span className="text-xs text-slate-500">Musterdokumentation</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Datenschutzerklärung
        </h1>

        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Hinweis:</strong> Dies ist ein Platzhalterdokument für die Marketing-Vorschau. Die endgültigen, rechtsverbindlichen Datenschutzbestimmungen, Angaben zum Datenschutzbeauftragten und Auftragsverarbeitungsverträge (AVV) müssen vor dem offiziellen Produktivbetrieb durch den Betreiber hinterlegt werden.
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-6">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              1. Grundsätzliches zum Datenschutz
            </h2>
            <p>
              Der Schutz deiner personenbezogenen Daten ist uns ein wichtiges Anliegen. Wir behandeln Daten stets vertraulich und im Einklang mit den gesetzlichen Datenschutzvorschriften der DSGVO sowie den länderspezifischen Regelungen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              2. Verantwortliche Stelle
            </h2>
            <p>
              [Name und Anschrift des Betreibers / Unternehmens werden vor Veröffentlichung hier eingetragen.]
            </p>
            <p className="text-xs text-slate-500">
              Kontakt E-Mail: [datenschutz@beispiel-domain.de]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              3. Datenerfassung auf dieser Website
            </h2>
            <p>
              Beim reinen Besuch dieser Marketing-Website werden technisch notwendige Server-Log-Daten (z. B. Browsertyp, Betriebssystem, Datum und Uhrzeit des Abrufs) erhoben. Es werden auf dieser Vorschauseite keine externen Tracking-Dienste ohne Einwilligung geladen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              4. Deine Betroffenenrechte
            </h2>
            <p>
              Du hast jederzeit das Recht auf unentgeltliche Auskunft über deine gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
