import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} – ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "KI Chatbot",
    "AI SaaS",
    "Website Chatbot",
    "Social Media Automation",
    "Model Context Protocol",
    "MCP Tools",
    "Managed Service Chatbot",
    "Next.js AI Platform",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteConfig.url,
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const media = window.matchMedia('(prefers-color-scheme: dark)');
              const apply = () => {
                let saved;
                try { saved = localStorage.getItem('dialogue-theme'); } catch {}
                document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : media.matches ? 'dark' : 'light';
              };
              apply();
              media.addEventListener('change', apply);
              window.addEventListener('storage', apply);
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
