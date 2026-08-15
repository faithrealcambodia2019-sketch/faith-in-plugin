import { ImageResponse } from "next/og";
import { site } from "@/lib/site-content";

/**
 * Social share image, generated at build time.
 *
 * Inherited by every route that does not define its own, so links to faithin.co
 * pasted into Facebook, Messenger, Telegram, X or WhatsApp render a real card
 * instead of a blank box.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          background: "linear-gradient(125deg, #4f46e5 0%, #7c3aed 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em" }}>
            FaithIn
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            The Christian community you belong to.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 32,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.9)",
              maxWidth: 860,
            }}
          >
            Khmer &amp; English Bible study, prayer, ministry resources and Christian jobs — free.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 27,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {site.domain}
        </div>
      </div>
    ),
    size,
  );
}
