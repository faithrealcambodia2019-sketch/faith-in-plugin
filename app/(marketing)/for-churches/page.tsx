import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "For Churches & Ministries",
  description:
    "Publish sermons and studies to a searchable library, post ministry job openings, and reach your members between Sundays — without competing with advertising for reach. Free for churches.",
  keywords: [
    "church platform Cambodia",
    "Christian ministry resources Khmer",
    "church sermon library",
    "Christian jobs Cambodia",
    "ministry job board",
  ],
  alternates: { canonical: "/for-churches" },
  openGraph: {
    title: `For Churches & Ministries | ${site.name}`,
    description:
      "Reach your members between Sundays: a searchable sermon library, a ministry jobs board, and verified leader profiles.",
    url: "/for-churches",
  },
};

const problems = [
  {
    title: "Your announcements reach a fraction of your members",
    body: "A church Facebook page shows a post to a slice of the people who already follow it, and ranks it against advertising. Faith In does not sell placement above your announcements.",
  },
  {
    title: "Last month's sermon is effectively gone",
    body: "Material posted to a feed or a group chat scrolls away within days. The resource library keeps sermons, lessons and studies categorised and searchable for as long as you want them.",
  },
  {
    title: "Openings travel by word of mouth",
    body: "Ministry roles get filled through whoever happens to hear. A jobs board puts them in front of people who are actually looking, with location, type and how to apply.",
  },
  {
    title: "Good Khmer material never leaves one Drive folder",
    body: "Churches build teaching material and it stays with the person who made it. Publishing to the library means other congregations can use what you have already written.",
  },
];

const steps = [
  {
    n: "1",
    title: "Create a leader account",
    body: "Sign up free and complete your profile with your church and ministry. Leaders can request a verification badge so members recognise the account.",
  },
  {
    n: "2",
    title: "Publish what you already have",
    body: "Upload existing sermons, lessons, slides and studies to the library with contributor credit. This is usually an afternoon of work for a year of material.",
  },
  {
    n: "3",
    title: "Bring your members in",
    body: "Share your Faith In link where your congregation already is — Telegram, Facebook, Messenger, the notice sheet. Members join free and find your material by searching.",
  },
  {
    n: "4",
    title: "Keep posting between Sundays",
    body: "Verses, blessings, prayer requests, announcements and job openings. The point is that midweek contact stops depending on one platform's reach.",
  },
];

export default function ForChurchesPage() {
  return (
    <>
      <section className="fi-hero" style={{ paddingBottom: 40 }}>
        <div className="fi-shell">
          <div className="fi-head fi-head--left" style={{ margin: 0, maxWidth: "36em" }}>
            <span className="fi-eyebrow">For churches &amp; ministries · Free</span>
            <h1>
              Reach your people <span className="fi-hl">between Sundays</span>
            </h1>
            <p>
              Faith In gives your church a searchable home for its teaching material, a place to
              post ministry roles, and a way to stay in contact with members that does not depend
              on a social network deciding who sees you.
            </p>
            <div className="fi-hero__cta">
              <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--lg">
                Get your church started
              </Link>
              <Link href="/contact" className="fi-btn fi-btn--ghost fi-btn--lg">
                Talk to us first
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="fi-section fi-section--tint">
        <div className="fi-shell">
          <div className="fi-head">
            <h2>What this actually solves</h2>
            <p>Four problems most churches recognise immediately.</p>
          </div>
          <div className="fi-grid">
            {problems.map((problem) => (
              <article key={problem.title} className="fi-card">
                <h3>{problem.title}</h3>
                <p>{problem.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fi-section">
        <div className="fi-shell">
          <div className="fi-head">
            <h2>Getting started</h2>
            <p>There is no onboarding call, no contract and no cost.</p>
          </div>
          <div className="fi-grid">
            {steps.map((step) => (
              <article key={step.n} className="fi-card">
                <span className="fi-card__km">Step {step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fi-section fi-section--tint">
        <div className="fi-shell">
          <div className="fi-cta">
            <h2>Put your church&rsquo;s teaching somewhere it lasts</h2>
            <p>
              Free to join, free to publish, free for your members. If you would rather ask
              questions first, the contact page reaches a person.
            </p>
            <Link href={site.appPath} className="fi-btn fi-btn--lg">
              Create a church account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
