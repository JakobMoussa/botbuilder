"use client";

import { comparisonTable } from "@/config/pricing";

export function PricingComparison() {
  return (
    <div className="w-full">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Direkter Tarifvergleich
        </h3>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Alle Konditionen, Kapazitäten und geplante Features transparent im Überblick.
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50">
              <th className="py-4 px-6 font-semibold text-slate-900 dark:text-white w-1/4">
                Feature / Kriterium
              </th>
              <th className="py-4 px-6 font-semibold text-slate-900 dark:text-white text-center">
                Starter
              </th>
              <th className="py-4 px-6 font-semibold text-indigo-600 dark:text-indigo-400 text-center bg-indigo-50/30 dark:bg-indigo-950/20">
                Pro
              </th>
              <th className="py-4 px-6 font-semibold text-slate-900 dark:text-white text-center">
                Agentur
              </th>
              <th className="py-4 px-6 font-semibold text-slate-900 dark:text-white text-center">
                Managed Service
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {comparisonTable.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-200">
                  {row.name}
                </td>
                <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">
                  {row.starter}
                </td>
                <td className="py-4 px-6 text-center font-medium text-slate-800 dark:text-slate-200 bg-indigo-50/20 dark:bg-indigo-950/10">
                  {row.pro}
                </td>
                <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">
                  {row.agency}
                </td>
                <td className="py-4 px-6 text-center font-medium text-indigo-700 dark:text-indigo-300">
                  {row.managed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card / Stack View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {["Starter", "Pro", "Agentur", "Managed Service"].map((tier, tIdx) => {
          const key = tIdx === 0 ? "starter" : tIdx === 1 ? "pro" : tIdx === 2 ? "agency" : "managed";
          const isPro = tIdx === 1;

          return (
            <div
              key={tier}
              className={`rounded-2xl border p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm ${
                isPro ? "border-indigo-400 ring-1 ring-indigo-400/30" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{tier}</h4>
                {isPro && (
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                    Beliebt
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-3 text-xs">
                {comparisonTable.map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400">{row.name}:</span>
                    <span className="font-medium text-right text-slate-800 dark:text-slate-200">
                      {row[key as keyof typeof row]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
