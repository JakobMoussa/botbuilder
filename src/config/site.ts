export interface NavItem {
  title: string;
  href: string;
  description?: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  navItems: NavItem[];
  footerNav: {
    product: NavItem[];
    company: NavItem[];
    legal: NavItem[];
  };
}

export const siteConfig: SiteConfig = {
  name: "Dialogue AI",
  tagline: "KI-Assistenten für Website, Social Media und Automatisierungen",
  description:
    "Verwalte Website-Chatbots, Social-Media-Kanäle und KI-gestützte Workflows zentral auf einer Plattform. Für Unternehmen und moderne Agenturen.",
  url: "http://localhost:3000",
  ogImage: "/og-image.png",
  navItems: [
    { title: "Leistungen", href: "/leistungen" },
    { title: "Preise", href: "/preise" },
    { title: "Über uns", href: "/ueber-uns" },
    { title: "Kontakt", href: "/kontakt" },
  ],
  footerNav: {
    product: [
      { title: "Leistungsübersicht", href: "/leistungen" },
      { title: "Preise & Tarife", href: "/preise" },
      { title: "Managed Service", href: "/preise#managed-service" },
    ],
    company: [
      { title: "Über uns", href: "/ueber-uns" },
      { title: "Kontakt", href: "/kontakt" },
    ],
    legal: [
      { title: "Datenschutz", href: "/datenschutz" },
      { title: "Impressum", href: "/impressum" },
      { title: "AGB", href: "/agb" },
    ],
  },
};
