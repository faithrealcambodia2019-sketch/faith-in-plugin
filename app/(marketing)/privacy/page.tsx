import type { Metadata } from "next";
import { site } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Faith In collects, uses, stores and protects your information, and the choices you have over your data.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "14 August 2026";

export default function PrivacyPage() {
  return (
    <section className="fi-section">
      <div className="fi-shell fi-prose">
        <h1 style={{ fontSize: "2.4rem" }}>Privacy Policy</h1>
        <p className="fi-prose__meta">Last updated: {LAST_UPDATED}</p>

        <p>
          This policy explains what information {site.name} collects, why we collect it, and what
          you can do about it. It applies to {site.domain} and the {site.name} application.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Account information.</strong> Your name, email address and password when you
            create an account. Passwords are handled by Firebase Authentication and are never
            stored by us in readable form.
          </li>
          <li>
            <strong>Profile information you choose to add.</strong> Photo, cover image, bio,
            location, role, church, ministry and industry. All of this is optional, and what you
            add is visible to other members.
          </li>
          <li>
            <strong>Content you create.</strong> Posts, blessings, comments, prayer requests,
            uploaded resources, job listings and messages.
          </li>
          <li>
            <strong>Technical information.</strong> Standard server and analytics data such as
            device type, browser, approximate region and pages visited, used to keep the service
            working and to understand which features are used.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To provide the platform: showing your content, delivering messages, running search.</li>
          <li>To secure accounts and detect abuse.</li>
          <li>To understand which features help people, so we know what to improve.</li>
          <li>To contact you about your account or significant changes to the service.</li>
        </ul>
        <p>
          We do not sell your personal information, and we do not sell advertising placement
          against your content.
        </p>

        <h2>Where your information is stored</h2>
        <p>
          {site.name} runs on Google Firebase (Authentication, Cloud Firestore and Cloud Storage)
          and is served through Vercel. These providers process data on our behalf and may store it
          on servers outside your country. Access is restricted by Firebase Security Rules and
          Firebase App Check.
        </p>

        <h2>Who can see your content</h2>
        <p>
          Posts marked public are visible to anyone using {site.name}. Posts with restricted
          visibility are shown according to the setting you choose. Private messages are visible to
          the people in the conversation. Resources you publish to the library are intended to be
          public, and job listings are public by design.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>You can edit or delete your profile information at any time from your account.</li>
          <li>You can delete content you have posted.</li>
          <li>
            You can request deletion of your account and associated data by writing to{" "}
            <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
          </li>
          <li>You can request a copy of the personal data we hold about you.</li>
        </ul>

        <h2>Children</h2>
        <p>
          {site.name} is not directed at children under 13, and we do not knowingly collect their
          personal information. If you believe a child has created an account, contact us and we
          will remove it.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We will update this page when our practices change, and we will change the &ldquo;last
          updated&rdquo; date above. Significant changes will be communicated in the application.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy: <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
        </p>

        <p className="fi-prose__meta" style={{ marginTop: 40 }}>
          This policy is provided in good faith as a plain-language description of how the service
          works. It is not legal advice, and it has not been reviewed by a lawyer. If {site.name}{" "}
          takes payments, expands into other jurisdictions, or handles data covered by regulations
          such as the GDPR, have a qualified lawyer review this document.
        </p>
      </div>
    </section>
  );
}
