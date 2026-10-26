"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingToggleProps {
  billingCycle: "monthly" | "yearly";
  onChange: (cycle: "monthly" | "yearly") => void;
}

export function PricingToggle({ billingCycle, onChange }: PricingToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <div className="relative inline-flex items-center rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={cn(
            "rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer",
            billingCycle === "monthly"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          Monatliche Abrechnung
        </button>
        <button
          type="button"
          onClick={() => onChange("yearly")}
          className={cn(
            "rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2",
            billingCycle === "yearly"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <span>Jährliche Abrechnung</span>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
            billingCycle === "yearly" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          )}>
            Vorteil
          </span>
        </button>
      </div>
      <Badge variant="planned" className="text-[11px] py-1">
        Jahrespreise sind vorläufige Vorschläge
      </Badge>
    </div>
  );
}
