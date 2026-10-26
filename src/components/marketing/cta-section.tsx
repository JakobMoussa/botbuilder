import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20 overflow-hidden text-white">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              <span>Jetzt durchstarten</span>
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
              Bereit, KI in deinem Unternehmen einzusetzen?
            </h2>

            <p className="mt-5 text-base sm:text-lg text-indigo-100/90 leading-relaxed max-w-2xl">
              Starte mit unseren Self-Service-Tarifen oder überlasse unserem Team die komplette Einrichtung und Betreuung im Managed Service.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/preise" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 font-semibold gap-2 shadow-lg">
                  Tarife vergleichen
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/kontakt" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Kontakt aufnehmen
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs text-indigo-200/70">
              Keine versteckten Kosten · Transparente Tarife · DSGVO-orientierte Ausrichtung
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
