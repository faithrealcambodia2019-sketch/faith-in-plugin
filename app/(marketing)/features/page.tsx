import type { Metadata } from "next";
import Link from "next/link";
import { features, site } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every Faith In feature: bilingual Khmer–English Bible study, community feed, blessings, prayer requests, a ministry resource library, a Christian jobs board, and a scripture design studio.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: `Features | ${site.name}`,
    description:
      "Bilingual Bible study, community, prayer, ministry resources and Christian jobs — everything inside Faith In.",
    url: "/features",
  },
};

export default function FeaturesPage() {
  return (
    <>
      <section className="fi-hero" style={{ paddingBottom: 32 }}>
        <div className="fi-shell">
          <div className="fi-head fi-head--left" style={{ margin: 0 }}>
            <span className="fi-eyebrow">Features</span>
            <h1>Eight tools, one platform</h1>
            <p>
              Faith In replaces the scattering of group chats, Drive folders and Facebook pages
              that most churches currently run on. Here is what each part does.
            </p>
          </div>
        </div>
      </section>

      <section className="fi-section" style={{ paddingTop: 24 }}>
        <div className="fi-shell">
          <div className="fi-grid">
            {features.map((feature) => (
              <article key={feature.slug} className="fi-card" id={feature.slug}>
                {feature.khmerTitle ? (
                  <span className="fi-card__km fi-km" lang="km">
                    {feature.khmerTitle}
                  </span>
                ) : null}
                <h3>{feature.title}</h3>
                <p>{feature.summary}</p>
                <p className="fi-card__more">{feature.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fi-section fi-section--tint">
        <div className="fi-shell">
          <div className="fi-cta">
            <h2>See it for yourself</h2>
            <p>Everything above is free to use. Create an account and start reading.</p>
            <Link href={site.appPath} className="fi-btn fi-btn--lg">
              Join Faith In free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
