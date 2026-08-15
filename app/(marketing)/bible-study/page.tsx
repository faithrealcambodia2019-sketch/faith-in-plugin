import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Khmer Bible Study Online — Khmer 1954, KJV, NIV & ESV Side by Side",
  description:
    "Read the Khmer Bible (ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤) side by side with the King James Version, NIV and ESV. Free bilingual Bible study with dictionary lookup, sermon notes and verse graphics.",
  keywords: [
    "Khmer Bible online",
    "ព្រះគម្ពីរខ្មែរ",
    "Khmer Bible 1954",
    "Khmer English Bible side by side",
    "Bible study Khmer",
    "Khmer sermon preparation",
  ],
  alternates: { canonical: "/bible-study" },
  openGraph: {
    title: `Khmer Bible Study Online | ${site.name}`,
    description:
      "Khmer 1954 beside KJV, NIV and ESV — free bilingual Bible study, dictionary lookup and sermon planning.",
    url: "/bible-study",
  },
};

const tools = [
  {
    title: "Side-by-side reading",
    body: "Open any book and chapter with Khmer 1954 in one column and KJV, NIV or ESV in the other. Scroll them together and compare a verse without switching apps or losing your place.",
  },
  {
    title: "Dictionary lookup",
    body: "Search a word and get its meaning without leaving the passage. Useful when an older Khmer rendering and a modern English one seem to say different things.",
  },
  {
    title: "Sermon planner",
    body: "Build a message in three columns — doctrine, encouragement, application — with the text open beside you, so the structure comes out of the passage rather than being bolted on after.",
  },
  {
    title: "Scripture Design Studio",
    body: "Turn a verse into a shareable graphic with proper Khmer typography: adjust font, size, line height and alignment over a wallpaper, then export for Telegram, Facebook or Messenger.",
  },
  {
    title: "Reading streak",
    body: "A simple streak and week count, so daily reading has something to hold onto. No badges, no leaderboard.",
  },
  {
    title: "Typing practice",
    body: "Type a passage from memory or from the screen. An old discipline that still works for learning verses in either language.",
  },
];

export default function BibleStudyPage() {
  return (
    <>
      <section className="fi-hero" style={{ paddingBottom: 40 }}>
        <div className="fi-shell fi-hero__inner">
          <div>
            <span className="fi-eyebrow">Bible Studio · Free</span>
            <h1>
              Study Scripture in <span className="fi-hl">Khmer and English</span>, together
            </h1>
            <p className="fi-hero__lede">
              Faith In includes the Khmer Bible (ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤) alongside the King James
              Version, New International Version and English Standard Version — displayed side by
              side, not one at a time. Built for pastors preparing sermons, students checking a
              translation, and anyone who grew up reading Khmer but studies in English.
            </p>
            <div className="fi-hero__cta">
              <Link href={site.appPath} className="fi-btn fi-btn--primary fi-btn--lg">
                Start reading free
              </Link>
            </div>
          </div>

          <div className="fi-preview" aria-label="Side-by-side Bible reading">
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
                    ខ្ញុំអាចនឹងធ្វើគ្រប់ការទាំងអស់បាន ដោយសារព្រះគ្រីស្ទដែលចំរើនកម្លាំងដល់ខ្ញុំ
                  </p>
                  <cite lang="km" className="fi-km">
                    ភីលីព ៤:១៣
                  </cite>
                </div>
                <div className="fi-verse-col">
                  <h4>King James Version</h4>
                  <p>I can do all things through Christ which strengtheneth me.</p>
                  <cite>Philippians 4:13</cite>
                </div>
              </div>
              <div className="fi-preview__foot">
                <span>Khmer 1954</span>
                <span>KJV</span>
                <span>NIV</span>
                <span>ESV</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fi-section fi-section--tint">
        <div className="fi-shell">
          <div className="fi-head">
            <h2>What is in the Bible Studio</h2>
          </div>
          <div className="fi-grid">
            {tools.map((tool) => (
              <article key={tool.title} className="fi-card">
                <h3>{tool.title}</h3>
                <p>{tool.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fi-section">
        <div className="fi-shell fi-prose">
          <h2>Why a bilingual Bible tool is different</h2>
          <p>
            Reading Scripture in two languages is not the same task as reading it in one. A
            bilingual reader is constantly checking one rendering against another — where the Khmer
            1954 uses an older word, where an English translation has chosen an interpretation, and
            what the passage is doing underneath both.
          </p>
          <p>
            Most Bible apps make that awkward. You switch translation, lose your scroll position,
            and have to hold the first version in your head while you read the second. Faith In
            puts both in view at once, because that is how the comparison actually gets made.
          </p>
          <h3>For pastors and teachers</h3>
          <p>
            If you preach in Khmer but study in English, the gap between your sources and your
            sermon is real work. Having Khmer 1954 open beside KJV, NIV or ESV — with a place to
            write notes in the same window — closes some of it.
          </p>
          <h3>For students and new readers</h3>
          <p>
            If your church reads Khmer and your study material is English, the side-by-side view
            lets you follow both without feeling like you are falling behind in either.
          </p>
          <p>
            <Link href={site.appPath}>Open the Bible Studio →</Link>
          </p>
        </div>
      </section>
    </>
  );
}
