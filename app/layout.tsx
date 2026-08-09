import type { Metadata } from "next";
import { Koh_Santepheap, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "../public/assets/css/faith-in.css";
import "../public/assets/css/community.css";
import { browserRuntimeConfig, siteConfig } from "@/lib/runtime-config";

const khmerFont = Koh_Santepheap({
  variable: "--font-koh-santepheap",
  subsets: ["khmer"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const brandFont = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: siteConfig.name,
  description: "Faith In Christian community platform",
  icons: { icon: "/assets/images/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="faith-in-tailwind-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "window.tailwind=window.tailwind||{};tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],serif:['Merriweather','serif']},colors:{brand:{vault:'#1FA88A',dark:'#15202B',bgStart:'#EAF8F4',bgEnd:'#F5FCF9'}}}}};",
          }}
        />
        <Script
          id="faith-in-runtime-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.cv_ajax=${JSON.stringify(browserRuntimeConfig)};`,
          }}
        />
        <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js" strategy="beforeInteractive" />
      </head>
      <body className={`cv-faith-in-platform ${khmerFont.variable} ${brandFont.variable}`}>
        {children}
        <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
        <Script src="/assets/js/faith-in-app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
