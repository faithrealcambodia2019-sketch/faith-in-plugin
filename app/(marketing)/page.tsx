import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/marketing/StructuredData";
import { audiences, faqs, features, site, stats } from "@/lib/site-content";

export const metadata: Metadata = {
  // `absolute` bypasses the "%s | Faith In" template so the homepage title is
  // not "Faith In — ... | Faith In".
  title: { absolute: `${site.name} — ${site.tagline}` },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <StructuredData />

      {/* ---------- Hero ---------- */}
      <section className="fi-hero">
        <div className="fi-shell fi-hero__inner">
          <div>
            <span className="fi-eyebrow">Khmer &amp; English · Free to join</span>
            <h1>
              The Christian community <span className="fi-hl">you belong to.</span>
            </h1>
            <p className="fi-hero__lede">
              Read the Khmer Bible beside KJV, NIV and ESV. Share posts, blessings and prayer
              requests. Publish sermons and studies your church can actually find again. Faith In
              is one platform for the Khmer-speaking church — and everyone who studies alongside
              it.
            </p>
            <p className="fi-hero__verse fi-km" lang="km">
              «ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីសោះ» — ទំនុកតម្កើង ២៣:១
            </p>
            <div className="fi-hero__cta">
              <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--lg">
                Join Faith In free
              </Link>
              <Link href="/features" className="fi-btn fi-btn--ghost fi-btn--lg">
                See what&rsquo;s inside
              </Link>
            </div>
            <p className="fi-hero__note">
              No cost to join. No adverts ranking above your church&rsquo;s announcements.
            </p>
          </div>

          {/* Static, server-rendered product preview — no JS required */}
          <div className="fi-preview" aria-label="Bible Studio preview">
            <div className="fi-preview__bar" aria-hidden="true">
              <span className="fi-preview__dot" />
              <span className="fi-preview__dot" />
              <span className="fi-preview__dot" />
            </div>
            <div className="fi-preview__body">
              <div className="fi-verse-row">
                <div className="fi-verse-col">
                  <h4>ព្រះគម្ពីរ ១៩៥៤</h4>
                  <p className="fi-km" lang="km">
                    ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១
                  </p>
                  <cite lang="km" className="fi-km">
                    យ៉ូហាន ៣:១៦
                  </cite>
                </div>
                <div className="fi-verse-col">
                  <h4>King James Version</h4>
                  <p>
                    For God so loved the world, that he gave his only begotten Son, that whosoever
                    believeth in him should not perish.
                  </p>
                  <cite>John 3:16</cite>
                </div>
              </div>
              <div className="fi-preview__foot">
                <span>Compare translations</span>
                <span>Dictionary lookup</span>
                <span>Sermon notes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="fi-section fi-section--tint">
        <div className="fi-shell">
          <div className="fi-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="fi-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="fi-section" id="features">
        <div className="fi-shell">
          <div className="fi-head">
            <h2>Everything the church needs, in one place</h2>
            <p>
              Bible study, community, resources and ministry work usually live in four different
              apps and a group chat. Faith In puts them together and keeps them searchable.
            </p>
          </div>
          <div className="fi-grid">
            {features.map((feature) => (
              <article key={feature.slug} className="fi-card">
                {feature.khmerTitle ? (
                  <span className="fi-card__km fi-km" lang="km">
                    {feature.khmerTitle}
                  </span>
                ) : null}
                <h3>{feature.title}</h3>
                <p>{feature.summary}</p>
              </article>
            ))}
          </div>
          <p style={{ marginTop: 28, textAlign: "center" }}>
            <Link href="/features">Read about every feature in detail →</Link>
          </p>
        </div>
      </section>

      {/* ---------- Audiences ---------- */}
      <section className="fi-section fi-section--tint">
        <div className="fi-shell">
          <div className="fi-head">
            <h2>Built for the whole church, not just individuals</h2>
            <p>
              Members, ministries and the people who teach them each need something different from
              the same platform.
            </p>
          </div>
          <div className="fi-grid">
            {audiences.map((audience) => (
              <article key={audience.title} className="fi-aud">
                <h3>{audience.title}</h3>
                <p>{audience.body}</p>
                <ul>
                  {audience.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Why bilingual ---------- */}
      <section className="fi-section">
        <div className="fi-shell">
          <div className="fi-head">
            <h2>Why bilingual matters</h2>
            <p>
              Most Christian platforms assume you read English. Most Khmer Christian material
              assumes you never need the English. Faith In is built for the very large number of
              people who need both — often in the same sentence.
            </p>
          </div>
          <div className="fi-grid">
            <article className="fi-card">
              <h3>Khmer typography, done properly</h3>
              <p>
                Khmer script needs different line height, font handling and line-breaking than
                Latin text. Faith In sets Khmer in Koh Santepheap throughout, so verses stay
                readable instead of clipping and stacking.
              </p>
            </article>
            <article className="fi-card">
              <h3>Side-by-side, not switched</h3>
              <p>
                You do not have to pick a language and lose the other. Khmer 1954 and your English
                translation sit next to each other, which is how a bilingual reader actually
                studies a passage.
              </p>
            </article>
            <article className="fi-card">
              <h3>Material that stays findable</h3>
              <p>
                Good Khmer-language sermons and lessons usually live in one person&rsquo;s Drive
                folder. The library gives them a categorised, searchable home other churches can
                use.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="fi-section fi-section--tint">
        <div className="fi-shell">
          <div className="fi-head">
            <h2>Common questions</h2>
          </div>
          <div className="fi-faq">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="fi-section">
        <div className="fi-shell">
          <div className="fi-cta">
            <h2>Join the community</h2>
            <p>
              Creating an account is free. Read Scripture, share what God is doing, ask for prayer,
              and find material in your own language.
            </p>
            <Link href={site.appPath} className="fi-btn fi-btn--lg">
              Create your free account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
