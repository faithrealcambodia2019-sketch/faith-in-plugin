import type { Metadata, Viewport } from "next";
import { Inter, Koh_Santepheap, Poppins } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/runtime-config";
import { site } from "@/lib/site-content";

const khmerFont = Koh_Santepheap({
  variable: "--font-koh-santepheap",
  subsets: ["khmer"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const brandFont = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const bodyFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Khmer Bible",
    "ព្រះគម្ពីរខ្មែរ",
    "Christian community Cambodia",
    "Khmer Christian resources",
    "Bible study Khmer English",
    "Christian jobs Cambodia",
    "sermon preparation Khmer",
    "Christian social network",
    "prayer requests",
  ],
  authors: [{ name: site.legalName, url: site.origin }],
  creator: site.legalName,
  publisher: site.legalName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.shortDescription,
    url: site.origin,
    locale: "en_US",
    alternateLocale: ["km_KH"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/assets/images/favicon.ico" },
      { url: "/assets/images/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/assets/images/favicon-180x180.png", sizes: "180x180" }],
  },
  category: "religion",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/*
        `cv-faith-in-platform` is kept on <body> because ~146 rules in the legacy
        application stylesheets are scoped to it. Marketing pages never load those
        stylesheets, and all marketing markup is nested inside `.fi` rather than
        being a direct child of <body>, so the legacy `body > header/footer`
        suppression rules cannot affect it.
      */}
      <body
        className={`cv-faith-in-platform ${bodyFont.variable} ${khmerFont.variable} ${brandFont.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
