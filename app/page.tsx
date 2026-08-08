"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell, BookMarked as Bible, BookOpen, Bookmark, BriefcaseBusiness, ChevronRight, CircleUserRound,
  Compass, Feather, Heart, Home, Library, Menu, MessageCircle, Moon, MoreHorizontal,
  PenLine, Plus, HandHeart as Pray, Search, Send, Settings, Share2, Sparkles, Sun, Users, X
} from "lucide-react";

type View = "home" | "prayer" | "bible" | "library" | "messages" | "profile";
type Post = { id: number; author: string; initials: string; time: string; text: string; tag?: string; likes: number; comments: number; liked?: boolean };
type PrayerItem = { id: number; name: string; text: string; count: number; prayed?: boolean };

const seedPosts: Post[] = [
  { id: 1, author: "Sokha Dara", initials: "SD", time: "18 min ago", tag: "Morning reflection", text: "Even when the road feels uncertain, God is already present in the next step. Today I’m choosing trust over fear.", likes: 128, comments: 19 },
  { id: 2, author: "Maly Chenda", initials: "MC", time: "1 hr ago", tag: "Blessing", text: "A small answer to a long prayer: my mother’s health report came back clear. Thank you to everyone who prayed with our family.", likes: 246, comments: 41 },
  { id: 3, author: "Pastor Vannak", initials: "PV", time: "3 hrs ago", tag: "Scripture", text: "“Let all that you do be done in love.” — 1 Corinthians 16:14. A simple verse, and a lifetime of practice.", likes: 97, comments: 12 }
];

const seedPrayers: PrayerItem[] = [
  { id: 1, name: "Anonymous", text: "Please pray for peace and wisdom as our family makes an important decision this week.", count: 84 },
  { id: 2, name: "Ruth S.", text: "Praying for strength for teachers and students beginning a new school term.", count: 56 },
  { id: 3, name: "Daniel K.", text: "Please remember communities affected by flooding and those serving them.", count: 132 }
];

const resources = [
  { title: "Start a daily Bible rhythm", type: "Reading plan", length: "7 days", color: "sage" },
  { title: "Praying through uncertainty", type: "Devotional", length: "8 min", color: "gold" },
  { title: "The Gospel of John", type: "Bible study", length: "21 lessons", color: "blue" },
  { title: "Faith at work", type: "Guide", length: "12 min", color: "rose" }
];

const nav = [
  { id: "home" as View, label: "Home", icon: Home },
  { id: "prayer" as View, label: "Prayer", icon: Pray },
  { id: "bible" as View, label: "Bible", icon: Bible },
  { id: "library" as View, label: "Library", icon: Library },
  { id: "messages" as View, label: "Messages", icon: MessageCircle },
  { id: "profile" as View, label: "Profile", icon: CircleUserRound }
];

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}

export default function FaithInApp() {
  const [view, setView] = useState<View>("home");
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [prayers, setPrayers] = useState<PrayerItem[]>(seedPrayers);
  const [composer, setComposer] = useState(false);
  const [draft, setDraft] = useState("");
  const [prayerDraft, setPrayerDraft] = useState("");
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPosts(readStored("faithin.posts", seedPosts));
    setPrayers(readStored("faithin.prayers", seedPrayers));
    setDark(readStored("faithin.dark", false));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("faithin.posts", JSON.stringify(posts)); }, [posts, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("faithin.prayers", JSON.stringify(prayers)); }, [prayers, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("faithin.dark", JSON.stringify(dark)); }, [dark, hydrated]);

  const filteredPosts = useMemo(() => posts.filter(post => `${post.author} ${post.text} ${post.tag || ""}`.toLowerCase().includes(query.toLowerCase())), [posts, query]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };

  function addPost(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setPosts(items => [{ id: Date.now(), author: "Faith Member", initials: "FM", time: "Just now", text: draft.trim(), likes: 0, comments: 0 }, ...items]);
    setDraft(""); setComposer(false); notify("Your encouragement was shared");
  }

  function addPrayer(event: FormEvent) {
    event.preventDefault();
    if (!prayerDraft.trim()) return;
    setPrayers(items => [{ id: Date.now(), name: "Faith Member", text: prayerDraft.trim(), count: 0 }, ...items]);
    setPrayerDraft(""); notify("Prayer request added");
  }

  function selectView(next: View) { setView(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return (
    <div className={dark ? "site dark" : "site"}>
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button>
        <button className="wordmark" onClick={() => selectView("home")}><span>✦</span> Faith In</button>
        <label className="global-search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Faith In" /></label>
        <div className="top-actions">
          <button onClick={() => setDark(value => !value)} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</button>
          <button onClick={() => notify("You’re all caught up")} aria-label="Notifications"><Bell /><i /></button>
          <button className="mini-profile" onClick={() => selectView("profile")}>FM</button>
        </div>
      </header>

      <div className="layout">
        <aside className={mobileNav ? "sidebar open" : "sidebar"}>
          <button className="nav-close" onClick={() => setMobileNav(false)}><X /></button>
          <nav>
            {nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => selectView(item.id)}><item.icon /><span>{item.label}</span>{item.id === "messages" && <b>3</b>}</button>)}
          </nav>
          <button className="share-primary" onClick={() => setComposer(true)}><Plus /> Share encouragement</button>
          <div className="sidebar-card"><Sparkles /><strong>Daily intention</strong><p>Make space to notice where God is moving today.</p></div>
          <div className="side-links"><button><Settings /> Settings</button><button><BriefcaseBusiness /> Opportunities</button></div>
        </aside>

        <main className="content">
          {view === "home" && <HomeView posts={filteredPosts} setPosts={setPosts} openComposer={() => setComposer(true)} notify={notify} />}
          {view === "prayer" && <PrayerView prayers={prayers} setPrayers={setPrayers} draft={prayerDraft} setDraft={setPrayerDraft} submit={addPrayer} />}
          {view === "bible" && <BibleView notify={notify} />}
          {view === "library" && <LibraryView query={query} notify={notify} />}
          {view === "messages" && <MessagesView notify={notify} />}
          {view === "profile" && <ProfileView posts={posts.length} prayers={prayers.filter(p => p.prayed).length} />}
        </main>

        <aside className="rightbar">
          <section className="verse-card"><span>VERSE OF THE DAY</span><blockquote>“Be joyful in hope, patient in affliction, faithful in prayer.”</blockquote><p>Romans 12:12</p><div><button onClick={() => notify("Verse saved")}><Bookmark /> Save</button><button onClick={() => notify("Share link copied")}><Share2 /> Share</button></div></section>
          <section className="people-card"><div className="section-title"><h3>People to encourage</h3><button>See all</button></div>{["Lina Sok", "Joshua Kim", "Ruth Dara"].map((name, i) => <div className="person-row" key={name}><span>{name.split(" ").map(n => n[0]).join("")}</span><div><strong>{name}</strong><small>{i === 0 ? "Shared a prayer" : i === 1 ? "New to Faith In" : "Celebrating today"}</small></div><button onClick={() => notify(`Encouragement sent to ${name}`)}>+</button></div>)}</section>
          <footer>© 2026 Faith In · Privacy · Community guidelines</footer>
        </aside>
      </div>

      {composer && <div className="modal-backdrop" onMouseDown={() => setComposer(false)}><form className="composer-modal" onSubmit={addPost} onMouseDown={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setComposer(false)}><X /></button><span className="modal-icon"><Feather /></span><h2>Share encouragement</h2><p>Offer a reflection, testimony, or word of hope.</p><textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)} placeholder="What is on your heart?" maxLength={1200} /><div className="composer-foot"><small>{draft.length}/1200</small><button disabled={!draft.trim()}><Send /> Share</button></div></form></div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function HomeView({ posts, setPosts, openComposer, notify }: { posts: Post[]; setPosts: React.Dispatch<React.SetStateAction<Post[]>>; openComposer: () => void; notify: (s: string) => void }) {
  return <><section className="hero"><div><span className="kicker">SATURDAY, AUGUST 8</span><h1>Good evening, friend.</h1><p>Take a breath. You belong here.</p></div><div className="hero-symbol">✦</div></section><button className="prompt" onClick={openComposer}><span>FM</span><p>Share what God is teaching you…</p><PenLine /></button><div className="feed-tabs"><button className="active">For you</button><button>Following</button><button>Blessings</button></div><section className="feed">{posts.length ? posts.map(post => <article className="post" key={post.id}><header><span className="avatar">{post.initials}</span><div><strong>{post.author}</strong><small>{post.time}</small></div><button><MoreHorizontal /></button></header>{post.tag && <span className="post-tag">{post.tag}</span>}<p>{post.text}</p><div className="post-stats"><span>{post.likes} encouragements</span><span>{post.comments} comments</span></div><div className="post-actions"><button className={post.liked ? "liked" : ""} onClick={() => setPosts(items => items.map(item => item.id === post.id ? { ...item, liked: !item.liked, likes: item.likes + (item.liked ? -1 : 1) } : item))}><Heart /> Encourage</button><button onClick={() => notify("Comments will open here")}><MessageCircle /> Comment</button><button onClick={() => notify("Share link copied")}><Share2 /> Share</button></div></article>) : <Empty icon={<Search />} title="No posts found" text="Try a different search." />}</section></>;
}

function PrayerView({ prayers, setPrayers, draft, setDraft, submit }: { prayers: PrayerItem[]; setPrayers: React.Dispatch<React.SetStateAction<PrayerItem[]>>; draft: string; setDraft: (s: string) => void; submit: (e: FormEvent) => void }) {
  return <><section className="page-heading prayer-heading"><span><Pray /></span><div><p>PRAYER WALL</p><h1>We carry one another.</h1><small>Share a request or quietly pray alongside someone today.</small></div></section><form className="prayer-form" onSubmit={submit}><textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="How can this community pray with you?" /><div><label><input type="checkbox" /> Share anonymously</label><button disabled={!draft.trim()}><Plus /> Add request</button></div></form><section className="prayer-grid">{prayers.map(item => <article className="prayer-card" key={item.id}><Pray /><span>{item.name}</span><p>{item.text}</p><button className={item.prayed ? "prayed" : ""} onClick={() => setPrayers(items => items.map(p => p.id === item.id ? { ...p, prayed: !p.prayed, count: p.count + (p.prayed ? -1 : 1) } : p))}>{item.prayed ? "Prayed" : "I prayed"} · {item.count}</button></article>)}</section></>;
}

function BibleView({ notify }: { notify: (s: string) => void }) {
  const [reference, setReference] = useState("John 15");
  return <><section className="page-heading bible-heading"><span><Bible /></span><div><p>SCRIPTURE</p><h1>Abide in the Word.</h1><small>Read slowly. Listen deeply. Carry one truth with you.</small></div></section><div className="bible-toolbar"><label><Search /><input value={reference} onChange={e => setReference(e.target.value)} /></label><button onClick={() => notify(`${reference} opened`)}>Go</button></div><article className="scripture"><header><div><span>John</span><h2>Chapter 15</h2></div><button onClick={() => notify("Reading settings opened")}>Aa</button></header><p><sup>1</sup> “I am the true vine, and my Father is the gardener. <sup>2</sup> He cuts off every branch in me that bears no fruit, while every branch that does bear fruit he prunes so that it will be even more fruitful.”</p><p><sup>4</sup> “Remain in me, as I also remain in you. No branch can bear fruit by itself; it must remain in the vine.”</p><blockquote><sup>5</sup> “I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.”</blockquote><p><sup>9</sup> “As the Father has loved me, so have I loved you. Now remain in my love.”</p></article></>;
}

function LibraryView({ query, notify }: { query: string; notify: (s: string) => void }) {
  const visible = resources.filter(r => `${r.title} ${r.type}`.toLowerCase().includes(query.toLowerCase()));
  return <><section className="page-heading library-heading"><span><BookOpen /></span><div><p>RESOURCE LIBRARY</p><h1>Tools for a rooted life.</h1><small>Thoughtful studies, devotionals, and guides for every season.</small></div></section><div className="category-row"><button className="active">Featured</button><button>Devotionals</button><button>Bible studies</button><button>Family</button><button>Leadership</button></div><section className="resource-grid">{visible.map((item, i) => <article className={`resource-card ${item.color}`} key={item.title}><div className="resource-art"><span>{i % 2 ? "✦" : "❦"}</span></div><small>{item.type}</small><h3>{item.title}</h3><p>{item.length}</p><button onClick={() => notify(`${item.title} saved`)}>Open resource <ChevronRight /></button></article>)}</section></>;
}

function MessagesView({ notify }: { notify: (s: string) => void }) {
  const [message, setMessage] = useState(""); const [sent, setSent] = useState<string[]>([]);
  return <><section className="page-heading messages-heading"><span><MessageCircle /></span><div><p>MESSAGES</p><h1>Meaningful conversations.</h1><small>Encourage one another with kindness and care.</small></div></section><div className="messages-shell"><aside>{["Sokha Dara", "Prayer Circle", "Maly Chenda"].map((name, i) => <button className={i === 0 ? "active" : ""} key={name}><span>{name.split(" ").map(n => n[0]).join("")}</span><div><strong>{name}</strong><small>{i === 0 ? "Thank you for checking in" : i === 1 ? "Ruth shared a request" : "God is good!"}</small></div></button>)}</aside><section><header><span>SD</span><div><strong>Sokha Dara</strong><small>Active recently</small></div></header><div className="chat-body"><p className="received">Thank you for the encouragement today. It arrived at exactly the right time.</p><p className="sent">I’m grateful it helped. I’ll keep praying with you.</p>{sent.map((text, i) => <p className="sent" key={i}>{text}</p>)}</div><form onSubmit={e => { e.preventDefault(); if (!message.trim()) return; setSent(v => [...v, message.trim()]); setMessage(""); notify("Message sent"); }}><input value={message} onChange={e => setMessage(e.target.value)} placeholder="Write a message…" /><button><Send /></button></form></section></div></>;
}

function ProfileView({ posts, prayers }: { posts: number; prayers: number }) {
  return <><section className="profile-hero"><div className="profile-avatar">FM</div><div><span>FAITH MEMBER</span><h1>Welcome to your space.</h1><p>A quiet record of encouragement shared, prayers carried, and Scripture saved.</p></div><button>Edit profile</button></section><div className="profile-stats"><article><strong>{posts}</strong><span>Posts shared</span></article><article><strong>{prayers}</strong><span>Prayers carried</span></article><article><strong>12</strong><span>Verses saved</span></article><article><strong>4</strong><span>Reading plans</span></article></div><section className="profile-sections"><article><Sparkles /><h3>Your faith journey</h3><p>Keep showing up with honesty, curiosity, and love. Small faithful rhythms become a rooted life.</p></article><article><Users /><h3>Your community</h3><p>You are connected with 28 people and three prayer circles.</p></article><article><Compass /><h3>Next step</h3><p>Continue your seven-day reading plan: Learning to trust.</p></article></section></>;
}

function Empty({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="empty">{icon}<h3>{title}</h3><p>{text}</p></div>; }
