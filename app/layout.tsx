import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://faithin.co"),
  title: "Faith In — Faith grows here",
  description: "A welcoming Christian community for prayer, Scripture, encouragement, and meaningful connection.",
  openGraph: {
    title: "Faith In — Faith grows here",
    description: "Pray together, explore Scripture, share blessings, and grow in faith.",
    url: "https://faithin.co",
    siteName: "Faith In",
    type: "website"
  },
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
