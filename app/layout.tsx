import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://faithin.co"),
  title: "Faith In",
  description: "Faith In Christian community platform",
  icons: { icon: "/assets/images/favicon.ico" },
};

const faithInConfig = {
  ajax_url: "/api/wordpress-bridge",
  nonce: "vercel",
  rest_root: "/api/curated-vault/v1",
  rest_faithin_root: "/api/faithin/v1",
  rest_nonce: "vercel",
  plugin_url: "/",
  auth: {
    mode: "firebase",
    google_client_id: "",
    allowed_domain: "",
    magic_link_enabled: false,
    firebase_config: {},
    site_domain: "faithin.co",
    site_origin: "https://faithin.co",
    register_url: "#profile",
    is_logged_in: false,
    current_user: null,
    verification_status: null,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Koh+Santepheap:wght@400;700;900&family=Poppins:wght@800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/social-mvp.css" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.tailwind=window.tailwind||{};tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],serif:['Merriweather','serif']},colors:{brand:{vault:'#1FA88A',dark:'#15202B',bgStart:'#EAF8F4',bgEnd:'#F5FCF9'}}}}};",
          }}
        />
        <script src="https://cdn.tailwindcss.com" defer />
        <script src="https://code.jquery.com/jquery-3.7.1.min.js" defer />
        <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js" defer />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.cv_ajax=${JSON.stringify(faithInConfig)};`,
          }}
        />
        <script src="/assets/js/main.js" defer />
      </head>
      <body className="cv-faith-in-platform">{children}</body>
    </html>
  );
}
