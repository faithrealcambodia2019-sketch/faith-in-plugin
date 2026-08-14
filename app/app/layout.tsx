import type { Metadata } from "next";
import "../../public/assets/css/faith-in.css";
import "../../public/assets/css/community.css";
import { browserRuntimeConfig } from "@/lib/runtime-config";
import { site } from "@/lib/site-content";

/**
 * Layout for the signed-in application.
 *
 * The heavy third-party scripts and the ~39,000 lines of legacy application CSS
 * are scoped to this layout rather than the root layout, so the public
 * marketing pages do not pay for them and can render without JavaScript.
 *
 * Note on script loading: next/script's `beforeInteractive` strategy only works
 * in the *root* layout, so it cannot be used here. Instead an inline bootstrap
 * (which does render in place) sets up the globals and then loads the
 * dependencies strictly in order — jQuery, then Lucide, then the application —
 * because faith-in-app.js expects `$` and `cv_ajax` to already exist.
 */
export const metadata: Metadata = {
  title: `Open ${site.name}`,
  description: `Sign in to ${site.name} to read the Khmer Bible, share posts and blessings, request prayer, and browse ministry resources.`,
  alternates: { canonical: "/app" },
  // The application is behind authentication and has no indexable content;
  // the marketing pages are what should rank.
  robots: { index: false, follow: true },
};

const TAILWIND_CONFIG =
  "window.tailwind=window.tailwind||{};tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],serif:['Merriweather','serif']},colors:{brand:{vault:'#1FA88A',dark:'#15202B',bgStart:'#EAF8F4',bgEnd:'#F5FCF9'}}}}};";

/** Loaded strictly in this order. */
const ORDERED_SCRIPTS = [
  "https://code.jquery.com/jquery-3.7.1.min.js",
  "https://unpkg.com/lucide@1.30.0/dist/umd/lucide.js",
  "https://cdn.tailwindcss.com",
  // Must come before the application: it installs the jQuery transport that
  // serves every `cv_*` data action from Firebase.
  "/assets/js/faith-in-backend.js",
  "/assets/js/faith-in-app.js",
];

function bootstrap(config: unknown) {
  return `
${TAILWIND_CONFIG}
window.cv_ajax=${JSON.stringify(config)};
(function () {
  var sources = ${JSON.stringify(ORDERED_SCRIPTS)};
  function next(i) {
    if (i >= sources.length) return;
    var s = document.createElement('script');
    s.src = sources[i];
    s.async = false;
    s.onload = function () { next(i + 1); };
    s.onerror = function () {
      if (window.console && console.error) {
        console.error('[Faith In] Failed to load ' + sources[i]);
      }
      next(i + 1);
    };
    document.head.appendChild(s);
  }
  next(0);
})();`;
}

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        id="faith-in-bootstrap"
        // Serialised configuration only; no user-controlled input.
        dangerouslySetInnerHTML={{ __html: bootstrap(browserRuntimeConfig) }}
      />
      {children}
    </>
  );
}
