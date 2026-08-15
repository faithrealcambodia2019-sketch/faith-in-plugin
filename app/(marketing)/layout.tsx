import "../marketing.css";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

/**
 * Layout for the public, server-rendered marketing pages.
 *
 * Everything is nested inside `.fi` rather than being a direct child of <body>,
 * so the legacy application stylesheets (which suppress `body > header` and
 * `body > footer`) cannot affect these pages even if their CSS is ever loaded.
 */
export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="fi">
      <a href="#main" className="fi-skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
