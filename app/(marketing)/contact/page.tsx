import type { Metadata } from "next";
import { site } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Faith In team — questions from churches and ministries, support requests, partnerships and press.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact | ${site.name}`,
    description: "Reach the Faith In team about your church, support, partnerships or press.",
    url: "/contact",
  },
};

const channels = [
  {
    title: "Churches & ministries",
    body: "Questions about bringing your congregation onto Faith In, publishing your teaching material, or posting ministry roles.",
    email: site.contactEmail,
  },
  {
    title: "Support",
    body: "Trouble signing in, a problem with your account, or something on the platform not working the way it should.",
    email: site.supportEmail,
  },
  {
    title: "Partnerships & press",
    body: "Working together, writing about Faith In, or anything else that needs a conversation rather than a form.",
    email: site.contactEmail,
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="fi-hero" style={{ paddingBottom: 32 }}>
        <div className="fi-shell">
          <div className="fi-head fi-head--left" style={{ margin: 0, maxWidth: "34em" }}>
            <span className="fi-eyebrow">Contact</span>
            <h1>Talk to a person</h1>
            <p>
              Faith In is small enough that messages reach someone who can actually do something
              about them.
            </p>
          </div>
        </div>
      </section>

      <section className="fi-section" style={{ paddingTop: 16 }}>
        <div className="fi-shell">
          <div className="fi-contact">
            {channels.map((channel) => (
              <article key={channel.title} className="fi-card">
                <h3>{channel.title}</h3>
                <p>{channel.body}</p>
                <p style={{ marginTop: 14 }}>
                  <a href={`mailto:${channel.email}`}>{channel.email}</a>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
