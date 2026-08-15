/**
 * Central content source for the public marketing pages.
 *
 * Everything a search engine, a social preview, or a first-time visitor sees is
 * defined here so copy stays consistent across pages and metadata.
 */

export const site = Object.freeze({
  name: "Faith In",
  legalName: "Faith In Inc.",
  domain: "faithin.co",
  origin: "https://faithin.co",
  appPath: "/app",
  tagline: "The Khmer–English Christian community platform",
  description:
    "Faith In is a bilingual Khmer and English Christian community platform for sharing posts and blessings, publishing ministry resources, requesting prayer, finding Christian jobs, and preparing bilingual Bible study notes.",
  shortDescription:
    "A bilingual Khmer and English Christian community: Bible study, prayer, ministry resources, and Christian jobs.",
  locales: ["en", "km"],
  contactEmail: "hello@faithin.co",
  supportEmail: "support@faithin.co",
});

export type NavLink = { href: string; label: string };

export const primaryNav: NavLink[] = [
  { href: "/features", label: "Features" },
  { href: "/bible-study", label: "Bible Study" },
  { href: "/for-churches", label: "For Churches" },
  { href: "/about", label: "About" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Platform",
    links: [
      { href: "/features", label: "Features" },
      { href: "/bible-study", label: "Bible Study" },
      { href: "/for-churches", label: "For Churches" },
      { href: "/app", label: "Open the app" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Faith In" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export type Feature = {
  slug: string;
  title: string;
  khmerTitle?: string;
  summary: string;
  detail: string;
  icon: string;
  status?: "Live" | "Beta";
};

export const features: Feature[] = [
  {
    slug: "bible-study",
    title: "Bible Studio",
    khmerTitle: "ព្រះគម្ពីរ",
    summary:
      "Prepare bilingual sermon notes now; licensed Khmer and English full-text reading is in development.",
    detail:
      "The current beta saves structured sermon notes and typing practice. Side-by-side Khmer and English Bible text, dictionary lookup, and reading tools will be enabled only after a licensed text source is integrated and verified.",
    icon: "book",
    status: "Beta",
  },
  {
    slug: "community-feed",
    title: "Community feed",
    khmerTitle: "សហគមន៍",
    summary:
      "Share posts, testimonies and encouragement with believers who speak your language.",
    detail:
      "Post text, images, audio or video to a feed built for a Christian community rather than a general social network. Control who sees each post and follow people whose work encourages you.",
    icon: "users",
  },
  {
    slug: "blessings",
    title: "Blessings",
    summary:
      "Send a verse as a designed card with music — the way people actually share encouragement.",
    detail:
      "Pick a verse, choose a background colour, add one of ten worship tracks, and send it. Blessings are made to be shared onward to Telegram, Facebook and Messenger, which is where most Cambodian Christian conversation already happens.",
    icon: "heart",
  },
  {
    slug: "prayer",
    title: "Prayer requests",
    khmerTitle: "អធិស្ឋាន",
    summary: "Ask for prayer and pray for others, without it getting lost in a group chat.",
    detail:
      "Post a request, see who is praying, and follow up when God answers. Requests stay organised and searchable instead of scrolling away in a busy chat thread.",
    icon: "hands",
  },
  {
    slug: "library",
    title: "Resource library",
    summary: "Publish and download sermons, lessons, studies and worship material.",
    detail:
      "Upload PDFs, slides, audio and video so other churches can use them. Everything is categorised — Bible study, leadership, worship, youth — with contributor credit, so good Khmer-language material stops living in one person's Drive folder.",
    icon: "library",
  },
  {
    slug: "jobs",
    title: "Ministry jobs board",
    summary: "Post and find roles at churches, schools and Christian organisations.",
    detail:
      "Churches list openings with location, type and how to apply. People looking for ministry work see them in one place instead of hearing about roles secondhand.",
    icon: "briefcase",
  },
  {
    slug: "design-studio",
    title: "Scripture Design Studio",
    summary: "Make shareable verse graphics in Khmer type, without opening Canva.",
    detail:
      "Set a verse, pick a wallpaper, adjust the Khmer or Latin typography, and export. Khmer script needs different line height and font handling than English — the studio handles that instead of fighting a generic design tool.",
    icon: "palette",
  },
  {
    slug: "sermon-planner",
    title: "Sermon planner",
    summary: "Organise sermon notes by doctrine, encouragement and application.",
    detail:
      "A structured place to build a message: capture the doctrinal point, the encouragement, and the application, with the passage open beside you.",
    icon: "notebook",
  },
];

export type Audience = {
  title: string;
  body: string;
  points: string[];
};

export const audiences: Audience[] = [
  {
    title: "For believers",
    body: "A place to grow, not just scroll.",
    points: [
      "Prepare bilingual Bible notes while the full-text reader is developed",
      "Share testimonies and blessings with people who understand them",
      "Ask for prayer and know someone is actually praying",
      "Find material for personal study in your own language",
    ],
  },
  {
    title: "For churches and ministries",
    body: "Reach your people between Sundays.",
    points: [
      "Publish sermons, lessons and studies to a searchable library",
      "Post ministry openings to people who are already looking",
      "Give your leaders a verified presence members can recognise",
      "Share announcements without depending on one Facebook page's reach",
    ],
  },
  {
    title: "For pastors and teachers",
    body: "Prepare faster, in the language you preach in.",
    points: [
      "Keep structured sermon notes for doctrine, encouragement and application",
      "Build sermon notes with the passage beside you",
      "Design verse graphics with proper Khmer typography",
      "Publish what you make so other churches can use it",
    ],
  },
];

export type FaqItem = { question: string; answer: string };

export const faqs: FaqItem[] = [
  {
    question: "Is Faith In free to use?",
    answer:
      "Yes. Creating an account, using the available Bible study tools, posting, requesting prayer, browsing the resource library and applying for jobs are all free.",
  },
  {
    question: "Which Bible translations are available?",
    answer:
      "The full-text reader is not live yet. Faith In plans to support licensed Khmer and English translations side by side; the current beta provides structured sermon notes and typing practice.",
  },
  {
    question: "Do I need to read Khmer to use Faith In?",
    answer:
      "No. The interface and content work in English, and Khmer is available everywhere it is useful. The platform is built for people who move between both languages.",
  },
  {
    question: "Can my church publish its own material?",
    answer:
      "Yes. Any member can upload sermons, lessons, studies and worship material to the resource library with contributor credit, and churches can post ministry job openings.",
  },
  {
    question: "How is Faith In different from a Facebook group?",
    answer:
      "A Facebook group buries what you posted last week and shows your announcements to a fraction of your members. Faith In keeps Bible study, prayer requests, resources and job posts organised and searchable, and it does not rank your church's post against advertising.",
  },
  {
    question: "Who is behind Faith In?",
    answer:
      "Faith In is built in Cambodia for the Khmer-speaking church and the wider Christian community. You can reach the team through the contact page.",
  },
];

export const stats = [
  { value: "Beta", label: "Bilingual Bible study workspace" },
  { value: "2", label: "Languages, everywhere it matters" },
  { value: "8", label: "Tools in one platform" },
];
