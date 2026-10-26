"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Menü öffnen"
          className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col justify-between w-full max-w-xs sm:max-w-sm">
        <div>
          <SheetHeader className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <SheetTitle className="flex items-center gap-2 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {siteConfig.name}
              </span>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {siteConfig.navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  )}
                >
                  <span>{item.title}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <Link href="/login" onClick={() => setOpen(false)} className="w-full">
            <Button variant="outline" className="w-full justify-center">
              Einloggen
            </Button>
          </Link>
          <Link href="/registrieren" onClick={() => setOpen(false)} className="w-full">
            <Button variant="gradient" className="w-full justify-center">
              Kostenlos starten
            </Button>
          </Link>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
            Keine Kreditkarte erforderlich
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
