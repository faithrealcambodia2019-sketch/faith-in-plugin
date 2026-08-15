import Link from "next/link";
import { primaryNav, site } from "@/lib/site-content";

export function SiteHeader() {
  return (
    <header className="fi-header">
      <div className="fi-shell fi-header__inner">
        <Link href="/" className="fi-logo" aria-label={`${site.name} home`}>
          <span>Faith</span>
          <span>In</span>
        </Link>

        <nav className="fi-nav" aria-label="Main">
          {primaryNav.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <details className="fi-mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {primaryNav.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link href={site.appPath}>Log in</Link>
          </nav>
        </details>

        <div className="fi-header__actions">
          <Link href={site.appPath} className="fi-btn fi-btn--quiet">
            Log in
          </Link>
          <Link href={site.appPath} className="fi-btn fi-btn--primary">
            Join free
          </Link>
        </div>
      </div>
    </header>
  );
}
