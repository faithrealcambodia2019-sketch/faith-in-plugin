import { faqs, site } from "@/lib/site-content";

/**
 * JSON-LD structured data.
 *
 * Organization + WebSite give search engines the brand entity and a sitelinks
 * search box; SoftwareApplication describes the product; FAQPage makes the
 * homepage eligible for expanded FAQ results.
 */
export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.origin}/#organization`,
        name: site.name,
        legalName: site.legalName,
        url: site.origin,
        description: site.description,
        logo: {
          "@type": "ImageObject",
          url: `${site.origin}/assets/images/faith-in-logo.png`,
        },
        areaServed: [
          { "@type": "Country", name: "Cambodia" },
          { "@type": "Place", name: "Worldwide" },
        ],
        knowsLanguage: ["en", "km"],
        email: site.contactEmail,
      },
      {
        "@type": "WebSite",
        "@id": `${site.origin}/#website`,
        url: site.origin,
        name: site.name,
        description: site.shortDescription,
        publisher: { "@id": `${site.origin}/#organization` },
        inLanguage: ["en", "km"],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${site.origin}/#application`,
        name: site.name,
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        url: site.origin,
        description: site.description,
        inLanguage: ["en", "km"],
        publisher: { "@id": `${site.origin}/#organization` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${site.origin}/#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is not user-controlled and contains no closing tags.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
