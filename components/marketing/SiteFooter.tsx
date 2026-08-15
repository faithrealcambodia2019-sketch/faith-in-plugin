import Link from "next/link";
import { footerNav, site } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="fi-footer">
      <div className="fi-shell">
        <div className="fi-footer__grid">
          <div className="fi-footer__about">
            <Link href="/" className="fi-logo" aria-label={`${site.name} home`}>
              <span>Faith</span>
              <span>In</span>
            </Link>
            <p>
              A bilingual Khmer and English Christian community platform — Bible study, prayer,
              ministry resources and Christian jobs, in one place.
            </p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="fi-footer__base">
          <span>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </span>
          <span>Built in Cambodia for the Khmer-speaking church.</span>
        </div>
      </div>
    </footer>
  );
}
