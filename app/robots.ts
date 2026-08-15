import type { MetadataRoute } from "next";
import { site } from "@/lib/site-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The application itself is behind authentication and has nothing to
        // index; the marketing pages are what should rank.
        disallow: ["/app", "/api/"],
      },
    ],
    sitemap: `${site.origin}/sitemap.xml`,
    host: site.origin,
  };
}
