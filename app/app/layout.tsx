import type { Metadata } from "next";
import "./tailwind.css";
import "../../public/assets/css/faith-in.css";
import "../../public/assets/css/community.css";
import "./production-ui.css";
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

/**
 * Build identifier appended to our own scripts as a cache-busting query.
 *
 * Without it, a browser that cached an earlier faith-in-backend.js keeps
 * running it after a deploy — which is how members kept seeing an upload error
 * that had already been fixed and shipped. The commit SHA changes on every
 * deploy, so the URL changes with it and the browser must refetch.
 */
const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  process.env.VERCEL_DEPLOYMENT_ID ||
  "dev";

/** Loaded strictly in this order. */
const ORDERED_SCRIPTS = [
  "https://code.jquery.com/jquery-3.7.1.min.js",
  "https://unpkg.com/lucide@1.30.0/dist/umd/lucide.js",
  // Must come before the application: it installs the jQuery transport that
  // serves every `cv_*` data action.
  `/assets/js/faith-in-backend.js?v=${BUILD_ID}`,
  `/assets/js/faith-in-app.js?v=${BUILD_ID}`,
];

function bootstrap(config: unknown) {
  // Prevent a deployment value from terminating the inline script tag. The
  // values are public Firebase identifiers, but they still cross an HTML
  // parser boundary and must be serialized for that context.
  const serializedConfig = JSON.stringify(config)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return `window.cv_ajax=${serializedConfig};
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
