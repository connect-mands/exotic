import { siteConfig } from "@/config/site";
import type { DestinationConfig } from "@/types/destination";

interface StructuredDataProps {
  destination: DestinationConfig;
  url: string;
}

export function StructuredData({ destination, url }: StructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `${url}#organization`,
        name: destination.branding.logoText,
        url,
        telephone: siteConfig.phone,
        email: siteConfig.email,
        description: destination.seo.description,
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: destination.seo.title,
        description: destination.seo.description,
      },
      ...destination.packages.map((pkg) => ({
        "@type": "TouristTrip",
        name: pkg.title,
        description: pkg.placesToVisit,
        offers: {
          "@type": "Offer",
          price: pkg.priceFrom.replace(/,/g, ""),
          priceCurrency: "INR",
        },
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
