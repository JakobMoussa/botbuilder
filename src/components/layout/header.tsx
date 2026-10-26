"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNavigation } from "./mobile-navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200 border-b",
        isScrolled
          ? "border-slate-200/80 bg-white/85 backdrop-blur-md shadow-sm dark:border-slate-800/80 dark:bg-slate-950/85"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-600/25">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              {siteConfig.name}
            </span>
            <span className="text-[11px] font-medium text-slate-500 -mt-1 hidden sm:block">
              AI Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-1.5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60"
          aria-label="Hauptnavigation"
        >
          {siteConfig.navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="default">
              Einloggen
            </Button>
          </Link>
          <Link href="/registrieren">
            <Button variant="gradient" size="default">
              Kostenlos starten
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
