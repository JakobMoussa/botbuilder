export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  isPopular?: boolean;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number; // Eigener Konfigurationswert (nicht implizit abgeleitet)
  yearlyPriceNote?: string;
  tokenLimit: string;
  tokenPeriod: string;
  websitesCount: string;
  botsCount: string;
  features: {
    text: string;
    status: "included" | "planned" | "unavailable";
    note?: string;
  }[];
  ctaText: string;
  ctaHref: string;
}

export interface ManagedPricingConfig {
  name: string;
  description: string;
  disclaimer: string;
  monthly: {
    monthlyFee: number;
    setupFee: number;
    billingText: string;
    firstYearTotal: number; // 12 * 49.99 + 249 = 848.88 €
  };
  yearly: {
    monthlyFee: number;
    setupFee: number;
    billingText: string;
    firstYearTotal: number; // 12 * 39.99 + 99 = 578.88 €
  };
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export interface ComparisonFeatureRow {
  name: string;
  category?: string;
  starter: string;
  pro: string;
  agency: string;
  managed: string;
}

export const selfServicePlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "Einstieg",
    description: "Ideal für Einzelunternehmer und kleine Websites mit klarem Fokus.",
    monthlyPrice: 19.99,
    yearlyPrice: 15.99,
    yearlyPriceNote: "Vorschlag (jährlich abgerechnet)",
    tokenLimit: "3 Millionen Tokens",
    tokenPeriod: "pro Monat",
    websitesCount: "1 Website",
    botsCount: "1 Chatbot",
    features: [
      { text: "3 Mio. Tokens pro Monat", status: "included" },
      { text: "1 Website & 1 Chatbot", status: "included" },
      { text: "Standard RAG & Wissensbasis", status: "included" },
      { text: "Website-Einbindung via Widget (geplant)", status: "planned" },
      { text: "Social-Media-Kanäle", status: "unavailable", note: "Nicht enthalten" },
      { text: "MCP-Tools & Integrationen", status: "unavailable", note: "Nicht enthalten" },
      { text: "Standard E-Mail-Support", status: "included" },
    ],
    ctaText: "Kostenlos starten",
    ctaHref: "/registrieren",
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Empfohlen",
    isPopular: true,
    description: "Für wachsende Unternehmen mit mehreren Websites und höherem Anfragevolumen.",
    monthlyPrice: 49.99,
    yearlyPrice: 39.99,
    yearlyPriceNote: "Vorschlag (jährlich abgerechnet)",
    tokenLimit: "100 Millionen Tokens",
    tokenPeriod: "pro Monat",
    websitesCount: "5 Websites",
    botsCount: "5 Chatbots",
    features: [
      { text: "100 Mio. Tokens pro Monat", status: "included" },
      { text: "5 Websites & 5 Chatbots", status: "included" },
      { text: "Erweiterte Wissensquellen & Crawler", status: "included" },
      { text: "Website-Einbindung via Widget (geplant)", status: "planned" },
      {
        text: "Instagram & Facebook Messenger",
        status: "planned",
        note: "Geplant / abhängig von Meta-API-Freigaben",
      },
      {
        text: "MCP-Tools & Automatisierungen",
        status: "planned",
        note: "Geplant / in Vorbereitung",
      },
      { text: "Priorisierter Support", status: "included" },
    ],
    ctaText: "Kostenlos starten",
    ctaHref: "/registrieren",
  },
  {
    id: "agency",
    name: "Agentur",
    badge: "Maximale Skalierung",
    description: "Für Agenturen und Dienstleister mit Kundenprojekten und hohem Volumen.",
    monthlyPrice: 149.99,
    yearlyPrice: 119.99,
    yearlyPriceNote: "Vorschlag (jährlich abgerechnet)",
    tokenLimit: "500 Millionen Tokens (Fair-Use)",
    tokenPeriod: "pro Monat (Fair-Use-Regeln)",
    websitesCount: "25+ Websites (erweiterbar)",
    botsCount: "Mehrere Chatbots",
    features: [
      {
        text: "Hohes Tokenkontingent (Fair-Use, keine unbegrenzte Garantie)",
        status: "included",
        note: "Transparente Fair-Use-Grenze gem. Provider-Limits",
      },
      { text: "Mehrere Chatbots & Websites", status: "included" },
      {
        text: "Agentur- & Mehrmandantenverwaltung",
        status: "planned",
        note: "Geplante Funktion",
      },
      {
        text: "Instagram & Facebook Messenger",
        status: "planned",
        note: "Abhängig von Meta-Zugriffen",
      },
      {
        text: "MCP-Tools & Custom Workflows",
        status: "planned",
        note: "Geplante Anbindung",
      },
      { text: "Dedizierter Onboarding-Support", status: "included" },
    ],
    ctaText: "Agentur-Zugang anfragen",
    ctaHref: "/kontakt?tarif=agentur",
  },
];

export const managedPricingConfig: ManagedPricingConfig = {
  name: "Managed Service – Rundum-Sorglos-Paket",
  description:
    "Wir übernehmen die Konfiguration, Wissensbasis-Pflege und laufende Betreuung deines Chatbots. Für Unternehmen, die sich auf ihr Kerngeschäft konzentrieren möchten.",
  disclaimer:
    "Hinweis: Konkrete Leistungen, Social-Media-Limits und eventuelle KI-/Drittanbieter-API-Gebühren müssen vor Vertragsabschluss individuell bestätigt werden. Alle Beträge verstehen sich zzgl. gesetzlicher USt.",
  monthly: {
    monthlyFee: 49.99,
    setupFee: 249.0,
    billingText: "monatlich kündbar",
    firstYearTotal: 848.88, // 12 * 49.99 + 249
  },
  yearly: {
    monthlyFee: 39.99,
    setupFee: 99.0,
    billingText: "12 Monate Vertragslaufzeit, jährlich abgerechnet",
    firstYearTotal: 578.88, // 12 * 39.99 + 99
  },
  features: [
    "1 voll integrierte Website inklusive Setup",
    "Social-Media-Kanäle (genaue Anzahl vor Veröffentlichung festzulegen)",
    "Professionelle Einrichtung, Prompt-Engineering & Testphase",
    "Laufende Wartung, Überwachung & Wissens-Updates",
    "Persönlicher Ansprechpartner & Support",
  ],
  ctaText: "Managed Service anfragen",
  ctaHref: "/kontakt?service=managed",
};

export const comparisonTable: ComparisonFeatureRow[] = [
  {
    name: "Monatlicher Preis (Startwert)",
    starter: "19,99 € / Monat",
    pro: "49,99 € / Monat",
    agency: "149,99 € / Monat",
    managed: "ab 39,99 € / Monat (+ Setup)",
  },
  {
    name: "Tokenlimit pro Monat",
    starter: "3 Millionen",
    pro: "100 Millionen",
    agency: "500 Mio. (Fair-Use-Regel)",
    managed: "Nach Bedarf / Abstimmung",
  },
  {
    name: "Anzahl Chatbots",
    starter: "1 Chatbot",
    pro: "5 Chatbots",
    agency: "Mehrere Chatbots",
    managed: "1 Chatbot (erweiterbar)",
  },
  {
    name: "Anzahl Websites",
    starter: "1 Website",
    pro: "5 Websites",
    agency: "25+ Websites",
    managed: "1 Website (erweiterbar)",
  },
  {
    name: "Social-Media-Anbindung",
    starter: "Nicht enthalten",
    pro: "Geplant (Meta-abhängig)",
    agency: "Geplant (Meta-abhängig)",
    managed: "Inklusive (Anzahl n.V.)",
  },
  {
    name: "MCP-Tools & Workflows",
    starter: "Nicht enthalten",
    pro: "Geplant",
    agency: "Geplant (Custom Tools)",
    managed: "Auf Anfrage eingerichtet",
  },
  {
    name: "Support & Verwaltung",
    starter: "Standard E-Mail",
    pro: "Priorisierter E-Mail-Support",
    agency: "Prioritär & Onboarding",
    managed: "Full-Managed durch unser Team",
  },
  {
    name: "Einrichtungsgebühr",
    starter: "0 €",
    pro: "0 €",
    agency: "0 €",
    managed: "99 € (jährlich) / 249 € (mtl.)",
  },
];
