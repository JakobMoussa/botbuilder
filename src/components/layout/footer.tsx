import Link from "next/link";
import { Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 bg-white/60 dark:border-slate-800/80 dark:bg-slate-950/60 backdrop-blur-sm transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Moderne KI-Assistenten und Automatisierungen für Unternehmen und zukunftsorientierte Agenturen.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-3 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Produkt & Tarife
              </h4>
              <ul className="mt-4 space-y-2.5">
                {siteConfig.footerNav.product.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Unternehmen
              </h4>
              <ul className="mt-4 space-y-2.5">
                {siteConfig.footerNav.company.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Rechtliches
              </h4>
              <ul className="mt-4 space-y-2.5">
                {siteConfig.footerNav.legal.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 dark:border-slate-800/60 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            © {currentYear} {siteConfig.name}. Alle Rechte vorbehalten. Öffentliche Marketing-Website.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/datenschutz" className="hover:underline">
              Datenschutz
            </Link>
            <Link href="/impressum" className="hover:underline">
              Impressum
            </Link>
            <Link href="/agb" className="hover:underline">
              AGB
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
