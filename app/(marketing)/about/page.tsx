import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Faith In is a bilingual Khmer–English Christian community platform built in Cambodia — Bible study, prayer, ministry resources and Christian jobs in one free place.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About | ${site.name}`,
    description:
      "Why Faith In exists: a Christian platform that treats Khmer as a first language, not an afterthought.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="fi-hero" style={{ paddingBottom: 32 }}>
        <div className="fi-shell">
          <div className="fi-head fi-head--left" style={{ margin: 0, maxWidth: "34em" }}>
            <span className="fi-eyebrow">About</span>
            <h1>
              A platform that treats Khmer as a <span className="fi-hl">first language</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="fi-section" style={{ paddingTop: 16 }}>
        <div className="fi-shell fi-prose">
          <p>
            Faith In started from a practical frustration. The Khmer-speaking church has real
            teaching, real material and real community — but almost none of the software it uses was
            built with Khmer in mind. Bible apps treat Khmer as a secondary translation you switch
            to. Design tools break Khmer line-breaking. Sermons and lessons circulate as files in
            group chats and disappear within a week.
          </p>
          <p>
            Meanwhile the platforms that do work are general-purpose social networks, where a
            church&rsquo;s announcement competes for attention with advertising, and where nothing
            you posted last month can be found again.
          </p>

          <h2>What we are building</h2>
          <p>
            Faith In is one place for the things a Christian community actually does: reading
            Scripture, encouraging each other, asking for prayer, sharing what has been taught, and
            finding people to do the work. It is bilingual throughout — Khmer and English side by
            side rather than one behind a language toggle — because that is how most of its users
            already read.
          </p>

          <h2>What we care about</h2>
          <ul>
            <li>
              <strong>Khmer done properly.</strong> Correct typography, correct line height, the
              Khmer 1954 Bible as a first-class translation rather than an option in a menu.
            </li>
            <li>
              <strong>Things that stay findable.</strong> A sermon uploaded today should still be
              searchable in two years. Feeds forget; libraries do not.
            </li>
            <li>
              <strong>No advertising between you and your church.</strong> We do not sell placement
              above a congregation&rsquo;s announcements.
            </li>
            <li>
              <strong>Free to join.</strong> Reading, posting, praying, publishing and applying for
              ministry roles cost nothing.
            </li>
          </ul>

          <h2>Where we are</h2>
          <p>
            Faith In is built in Cambodia, for the Khmer-speaking church first and the wider
            Christian community alongside it. The platform is early and it is growing — if
            something is missing or wrong, we would rather hear it than not.
          </p>

          <p>
            <Link href="/contact">Get in touch →</Link>
          </p>
        </div>
      </section>

      <section className="fi-section fi-section--tint">
        <div className="fi-shell">
          <div className="fi-cta">
            <h2>Join us</h2>
            <p>Free to create an account, and free to bring your whole church.</p>
            <Link href={site.appPath} className="fi-btn fi-btn--lg">
              Create your free account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
