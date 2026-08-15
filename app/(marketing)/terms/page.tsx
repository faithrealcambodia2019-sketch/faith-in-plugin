import type { Metadata } from "next";
import { site } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you use Faith In — your account, the content you post, acceptable use, and the limits of the service.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "14 August 2026";

export default function TermsPage() {
  return (
    <section className="fi-section">
      <div className="fi-shell fi-prose">
        <h1 style={{ fontSize: "2.4rem" }}>Terms of Service</h1>
        <p className="fi-prose__meta">Last updated: {LAST_UPDATED}</p>

        <p>
          These terms apply when you use {site.domain} and the {site.name} application. By creating
          an account you agree to them.
        </p>

        <h2>Your account</h2>
        <p>
          You must provide accurate information when you register, keep your password secure, and
          be responsible for what happens under your account. You must be at least 13 years old to
          use {site.name}. One person, one account.
        </p>

        <h2>Content you post</h2>
        <p>
          You keep ownership of everything you post. By posting, you give {site.name} permission to
          store and display that content so the service can work — for example showing your post in
          the feed, or making a resource you published available in the library.
        </p>
        <p>
          You are responsible for having the right to post what you post. Do not upload material
          that belongs to someone else without permission, including copyrighted books, music,
          sermons or video.
        </p>

        <h2>Acceptable use</h2>
        <p>Do not use {site.name} to:</p>
        <ul>
          <li>Harass, threaten, impersonate or abuse other people.</li>
          <li>Post content that is unlawful, sexually explicit, or that exploits or endangers children.</li>
          <li>Solicit money under false pretences, or run scams and pyramid schemes.</li>
          <li>Spread malware, attempt to break the platform&rsquo;s security, or scrape it in bulk.</li>
          <li>Post spam or repetitive commercial promotion.</li>
        </ul>
        <p>
          We may remove content and suspend or close accounts that break these rules, and we will
          try to tell you why.
        </p>

        <h2>Ministry jobs and resources</h2>
        <p>
          {site.name} hosts job listings and uploaded resources but does not verify them.
          Verification badges indicate that we have checked an identity claim; they are not an
          endorsement of a person, church or organisation. Use your judgement, and take normal care
          before sending money, personal documents or agreeing to work.
        </p>

        <h2>The service</h2>
        <p>
          {site.name} is provided as it is, free of charge, with no guarantee that it will be
          available without interruption or free of errors. We may change or discontinue features.
          We are not liable for indirect or consequential loss arising from your use of the
          service, to the extent the law allows.
        </p>

        <h2>Ending your use</h2>
        <p>
          You can stop using {site.name} and request account deletion at any time by writing to{" "}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>

        <h2>Changes</h2>
        <p>
          We will update these terms as the service develops and change the &ldquo;last
          updated&rdquo; date above. Continuing to use {site.name} after a change means you accept
          the updated terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
        </p>

        <p className="fi-prose__meta" style={{ marginTop: 40 }}>
          These terms are a plain-language starting point, not legal advice, and they have not been
          reviewed by a lawyer. Before {site.name} takes payments, handles donations, or operates at
          scale in additional countries, have a qualified lawyer review this document and confirm
          the governing law and dispute-resolution clauses your situation needs.
        </p>
      </div>
    </section>
  );
}
