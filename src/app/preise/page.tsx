"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  ShieldAlert,
  Sparkles,
  Headphones,
  ArrowRight,
  Info,
  CalendarCheck,
} from "lucide-react";
import { PricingToggle } from "@/components/marketing/pricing-toggle";
import { PricingCard } from "@/components/marketing/pricing-card";
import { PricingComparison } from "@/components/marketing/pricing-comparison";
import { selfServicePlans, managedPricingConfig } from "@/config/pricing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly");

  const managedVariant =
    billingCycle === "monthly"
      ? managedPricingConfig.monthly
      : managedPricingConfig.yearly;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Banner */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-indigo-50/60 via-white to-transparent dark:from-indigo-950/20 dark:via-slate-950 dark:to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-4">
            Faire & transparente Konditionen
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Wähle den passenden Tarif für dein Wachstum
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Ob flexibler Self-Service für dein Team oder schlüsselfertiger Managed Service mit persönlicher Rundum-Betreuung – starte noch heute ohne Risiko.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-10">
            <PricingToggle
              billingCycle={billingCycle}
              onChange={setBillingCycle}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-24">
        {/* Section 1: Self-Service Plans */}
        <section id="self-service">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Kategorie 1
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Self-Service Tarife
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Für Macher, die ihre Assistenten und Prompts selbstständig verwalten möchten.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {selfServicePlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
              />
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
            <div>
              <strong>Hinweis zu Limits & Tokenkontingenten:</strong> Alle angegebenen Token-Kontingente gelten jeweils pro Abrechnungsmonat. Nicht genutzte Tokens verfallen am Monatsende. Es gibt keine versteckten Einrichtungsgebühren bei den Self-Service-Tarifen. Ein Upgrade oder Downgrade ist jederzeit möglich.
            </div>
          </div>
        </section>

        {/* Section 2: Managed Service (Clearly separated) */}
        <section id="managed-service" className="scroll-mt-24 border-t border-slate-200/70 dark:border-slate-800/70 pt-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="success" className="mb-2">
              Kategorie 2 · Rundum-Sorglos-Paket
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {managedPricingConfig.name}
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {managedPricingConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Managed Service Pricing Box */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border-2 border-emerald-500/80 bg-white dark:bg-slate-900 p-8 shadow-xl dark:shadow-emerald-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="success">Full-Managed</Badge>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {billingCycle === "monthly" ? "Monatsvertrag" : "Jahresvertrag"}
                  </span>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                      {managedVariant.monthlyFee.toFixed(2).replace(".", ",")} €
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      / Monat
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    + {managedVariant.setupFee} € einmalige Einrichtung
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ({managedVariant.billingText})
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="font-bold text-sm">
                    Rechnerische Jahresgesamtkosten:
                  </div>
                  <div className="text-xl font-extrabold mt-1 text-emerald-700 dark:text-emerald-300">
                    {managedVariant.firstYearTotal.toFixed(2).replace(".", ",")} €
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {billingCycle === "monthly"
                      ? "12 × 49,99 € + 249 € Setup = 848,88 € im 1. Jahr (zzgl. USt.)"
                      : "12 × 39,99 € + 99 € Setup = 578,88 € im 1. Jahr (zzgl. USt.)"}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Link href={managedPricingConfig.ctaHref} className="w-full">
                  <Button variant="gradient" size="lg" className="w-full justify-center gap-2">
                    <Headphones className="h-4 w-4" />
                    {managedPricingConfig.ctaText}
                  </Button>
                </Link>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Unverbindliche Erstberatung durch unser Team
                </p>
              </div>
            </div>

            {/* Managed Service Scope Box */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60 p-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Inbegriffene Betreuungsleistungen:
                </h3>
                <ul className="space-y-4">
                  {managedPricingConfig.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 mt-0.5">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                      <span className="font-medium leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Wichtige Transparenzhinweise vor Vertragsschluss:
                  </div>
                  <p className="leading-relaxed">
                    {managedPricingConfig.disclaimer}
                  </p>
                  <p className="leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
                    Die oben genannten Summen verstehen sich ohne etwaige zusätzliche externe Modell- oder Drittanbieter-API-Gebühren. Es findet im Rahmen dieser Website noch keine direkte Online-Zahlung statt.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Bereitstellung nach Freigabe</span>
                <span>DSGVO-konforme Serverstandorte</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Comparison Table */}
        <section id="vergleich" className="scroll-mt-24 border-t border-slate-200/70 dark:border-slate-800/70 pt-16">
          <PricingComparison />
        </section>
      </div>

      {/* FAQ or Additional Notes */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/60 mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Fragen zu unseren Tarifen oder individuellen Anforderungen?
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Unser Beratungsteam steht dir jederzeit zur Verfügung, um die optimale Konfiguration für dein Unternehmen zu finden.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/kontakt">
              <Button variant="default">
                Jetzt unverbindlich anfragen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
