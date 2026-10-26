"use client";

import Link from "next/link";
import { Check, Clock, HelpCircle, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricingPlan } from "@/config/pricing";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  plan: PricingPlan;
  billingCycle: "monthly" | "yearly";
}

export function PricingCard({ plan, billingCycle }: PricingCardProps) {
  const currentPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

  return (
    <Card
      className={cn(
        "relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl",
        plan.isPopular
          ? "border-indigo-500 shadow-lg shadow-indigo-500/10 dark:border-indigo-500 dark:shadow-indigo-500/10 ring-2 ring-indigo-500/30"
          : "border-slate-200/90 dark:border-slate-800"
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
            Empfohlener Tarif
          </span>
        </div>
      )}

      <div>
        <CardHeader className={cn("space-y-4", plan.isPopular && "pt-8")}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            {plan.badge && (
              <Badge variant={plan.isPopular ? "default" : "secondary"}>
                {plan.badge}
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm min-h-[40px]">
            {plan.description}
          </CardDescription>

          <div className="pt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {currentPrice.toFixed(2).replace(".", ",")} €
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                / Monat
              </span>
            </div>
            {billingCycle === "yearly" && plan.yearlyPriceNote && (
              <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {plan.yearlyPriceNote}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Tokenlimit: <span className="font-semibold text-slate-700 dark:text-slate-300">{plan.tokenLimit}</span> ({plan.tokenPeriod})
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Leistungsumfang
            </p>
            <ul className="space-y-2.5">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                  {feature.status === "included" && (
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                  {feature.status === "planned" && (
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" title="Geplante Funktion">
                      <Clock className="h-3 w-3" />
                    </span>
                  )}
                  {feature.status === "unavailable" && (
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    </span>
                  )}

                  <div className="flex-1">
                    <span
                      className={cn(
                        feature.status === "unavailable"
                          ? "text-slate-400 line-through dark:text-slate-500"
                          : "text-slate-700 dark:text-slate-300 font-medium"
                      )}
                    >
                      {feature.text}
                    </span>
                    {feature.note && (
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                        {feature.note}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        <Link href={plan.ctaHref} className="w-full">
          <Button
            variant={plan.isPopular ? "gradient" : "outline"}
            className="w-full justify-center text-sm font-semibold h-11"
          >
            {plan.ctaText}
          </Button>
        </Link>
        <span className="text-[11px] text-center text-slate-400">
          Vorerst unverbindliche Registrierung
        </span>
      </CardFooter>
    </Card>
  );
}
