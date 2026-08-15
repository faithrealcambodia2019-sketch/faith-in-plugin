# Faith In — Growth & Visibility Plan

Written 14 August 2026. This is the plan for the second half of "make it professional and famous":
what to do after the code changes ship.

---

## The core strategic decision

**Do not compete as "a Christian social network."**

That category already has Pray.com, Faithly, FaithSocial and FaithOnline, all with more funding and
a head start in English-speaking markets. Faith In will not win a head-on search fight for
"christian community app."

**Compete as the bilingual Khmer–English Christian platform.**

This is a real position, it is defensible, and almost nobody is contesting it:

- The Khmer Bible (ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤) side by side with KJV/NIV/ESV is genuinely hard to find online.
- Khmer typography in design tools is genuinely bad, and the Scripture Design Studio fixes it.
- Search volume in this niche is small, but competition is near zero — you can realistically own it.
- A defensible niche is how you earn the right to expand later. Own Cambodia, then own Khmer
  diaspora communities, then look wider.

Every decision below follows from this.

---

## Phase 1 — Make the site findable (weeks 1–2)

The code changes in this release do most of the technical work. What remains is manual:

### Verify and submit

1. **Google Search Console** — add `faithin.co`, verify by DNS record, submit
   `https://faithin.co/sitemap.xml`. Then use "URL Inspection → Request indexing" on the homepage,
   `/bible-study` and `/for-churches` to skip the discovery wait.
2. **Bing Webmaster Tools** — same, and it takes an import from Search Console in two clicks.
   Bing matters more than people assume because it feeds ChatGPT search.
3. **Check the redirect.** `faithin.co` in a browser that visited the old WordPress site still
   redirects to `faithinco.wordpress.com`, because a 301 was cached. DNS and Vercel are configured
   correctly — this is browser cache. Confirm in a private window. If the old WordPress.com site
   still has domain mapping attached, remove it, or old links will keep leaking.
4. **Set up the Google OAuth Client ID** (see `docs/DEPLOYMENT.md` note) so Google sign-in works
   instead of being hidden. Removing a sign-in method costs conversions.

### Set up the analytics you'll need to steer by

- Vercel Analytics is already available on the project — enable it.
- Add Google Search Console's Performance report to your weekly routine. Queries you rank for on
  page 2 are the cheapest wins you will ever get.

---

## Phase 2 — Publish content that ranks (weeks 2–12)

The marketing pages establish the site. They will not, by themselves, bring traffic. Content will.

**You are already producing exactly the right raw material** — the sermon decks, Khmer lesson
files and Bible teaching in your Documents folder are the content library. The work is
republishing it as indexable web pages rather than only as `.pptx` and `.docx`.

### The content engine

Add a `/articles` or `/blog` section (server-rendered, same pattern as the marketing pages) and
publish two pieces per week. Every article should exist in **both Khmer and English**, on separate
URLs, cross-linked with `hreflang`. That doubles the indexable surface for the same writing effort.

### Target these first — high intent, near-zero competition

| Priority | Query cluster | Page to build |
|---|---|---|
| 1 | ព្រះគម្ពីរខ្មែរ online / Khmer Bible online | Already live: `/bible-study` |
| 2 | Khmer Bible verse of the day | Daily verse page, updated automatically |
| 3 | ខគម្ពីរ about hope / fear / healing | One topical verse-collection page per theme |
| 4 | Khmer sermon outline / សេចក្ដីអធិប្បាយ | Publish your existing sermons as web pages |
| 5 | Christian jobs Cambodia | Public, indexable job listing pages |
| 6 | Khmer worship songs lyrics | Lyrics + chord pages, if licensing allows |
| 7 | How to read the Bible in Khmer and English | Guide article |

The verse-collection pages (row 3) are the highest-leverage item. People search for
"Bible verses about anxiety" constantly, in every language, forever. There is almost nothing good
in Khmer.

### One rule

Do not publish thin AI-spun filler. Google's helpful-content systems demote it, and in a niche
this small your reputation is the asset. Publish the teaching you are already doing.

---

## Phase 3 — Distribution where your audience already is (ongoing)

SEO compounds slowly. Social is where the first thousand users come from.

### Channel priorities for Cambodia

1. **Facebook & Messenger** — still dominant in Cambodia. This is your primary channel, not a
   secondary one.
2. **Telegram** — where Cambodian church groups actually coordinate. Blessings and verse graphics
   are built to be forwarded here. Make sure sharing a Faith In link into Telegram produces a good
   preview (it now will — the OG image ships in this release).
3. **TikTok** — fastest-growing reach for Khmer-language content. Short verse videos, 15–30s.
4. **YouTube** — for full sermons and teaching, and it doubles as search.

### The one growth mechanic that matters

**Blessings are the loop.** A user makes a verse card, shares it to Telegram or Facebook, and the
recipients see something worth making themselves. Make sure every shared blessing carries a
visible, tasteful `faithin.co` mark and links back. This is the single highest-leverage product
change for growth, and it costs almost nothing to implement.

### Weekly rhythm

- 3 verse graphics (from the Scripture Design Studio — dogfood your own tool)
- 1 short video (TikTok + Reels + Shorts, same asset)
- 1 article, published in Khmer and English
- 1 church or ministry contacted directly

---

## Phase 4 — Credibility for churches and partners

Churches are cautious and they talk to each other. One respected church joining brings others.

1. **Get 3–5 pilot churches properly onboarded.** Not "signed up" — actually using it, with their
   sermons uploaded. Do this by hand. It does not scale and that is fine.
2. **Write those up as case studies** once there is something real to describe.
3. **Verification badges** are a genuine trust asset — make sure leaders of real churches have
   them, and that the criteria are written down publicly so the badge means something.
4. **Get listed** on Christian app directories (faith.tools and similar), Cambodian NGO and church
   directories, and Christian resource aggregators. These are the backlinks that also send real
   people.
5. **Local press and Christian media** — a Khmer-language Christian platform built in Cambodia is
   an actual story. It is worth pitching once there are users to talk about.

---

## What "success" looks like, honestly

| Timeframe | Realistic target |
|---|---|
| Month 1 | Indexed in Google; ranking for "faith in" brand terms and a handful of long-tail Khmer queries |
| Month 3 | Page 1 for several Khmer Bible / Khmer sermon queries; 3–5 churches actively publishing; first few hundred registered users |
| Month 6 | The default answer to "where do I read the Khmer Bible online"; steady organic signups; a working blessing-share loop |
| Month 12 | Recognised in the Cambodian church; enough content depth that new pages rank within days |

"Famous" is downstream of being genuinely the best at one specific thing for one specific group of
people. Being the best bilingual Khmer–English Bible and church platform is achievable in a year.
Being a famous global Christian social network is not, and chasing it would waste the real
advantage you already have.

---

## Technical follow-ups worth doing

Not blocking, but each one improves the product:

1. **Continue reducing legacy global CSS.** Tailwind is now compiled locally from the application
   source, but the older application stylesheets are still large and should be split by feature as
   screens are migrated to React components.
2. **Split `faith-in-app.js`.** One 8,000-line file is loaded in full for every user on every
   visit. Splitting by tab (feed / bible / jobs / messaging) would meaningfully improve load time,
   especially on mobile data.
3. **Self-host the fonts.** `next/font/google` fetches at build time; a Google Fonts outage fails
   your build. `next/font/local` removes that dependency.
4. **Add `hreflang`** once Khmer and English versions of pages exist.
5. **Make job listings and public resources individually indexable.** Each job at its own URL is a
   page that can rank for "youth pastor job Phnom Penh". Right now they exist only inside the app,
   where Google cannot see them. This is probably the largest untapped SEO opportunity in the
   product.
6. **Progressive Web App manifest** so members can install Faith In to their home screen. In a
   mobile-first market this matters more than it does in the West.
