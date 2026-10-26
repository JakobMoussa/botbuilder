import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Impressum (Platzhalter)",
  description: "Gesetzliche Anbieterkennzeichnung nach § 5 DDG.",
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant="planned">Rechtlicher Platzhalter</Badge>
          <span className="text-xs text-slate-500">Angaben gemäß § 5 DDG</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Impressum
        </h1>

        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Wichtiger Hinweis:</strong> Diese Seite enthält absichtlich Platzhalter. Vor der Veröffentlichung und dem kommerziellen Live-Betrieb müssen die tatsächlichen Angaben des Betreibers eingetragen werden. Es wurden keine fiktiven Adressen oder Handelsregister-Daten erfunden.
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-6">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Diensteanbieter
            </h2>
            <p>
              [Firmenname / Rechtsform]<br />
              [Straße und Hausnummer]<br />
              [PLZ und Ort]<br />
              [Land]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Kontakt
            </h2>
            <p>
              Telefon: [Telefonnummer folgt vor Veröffentlichung]<br />
              E-Mail: [E-Mail-Adresse folgt vor Veröffentlichung]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Vertretungsberechtigte Personen
            </h2>
            <p>
              [Name(n) der vertretungsberechtigten Geschäftsführer / Inhaber]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Registereintrag & Umsatzsteuer
            </h2>
            <p>
              Registergericht: [z. B. Amtsgericht Musterstadt]<br />
              Registernummer: [HRB XXXXX]<br />
              Umsatzsteuer-Identifikationsnummer: [DE XXXXXXXXX]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              EU-Streitschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
