import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { getDestinationConfig } from "@/lib/get-destination";

function getSiteUrl(domain: string): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? `https://${domain}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const destination = await getDestinationConfig();
  const siteUrl = getSiteUrl(destination.domain);

  return {
    title: destination.seo.title,
    description: destination.seo.description,
    keywords: destination.seo.keywords,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: siteUrl },
    openGraph: {
      title: destination.seo.title,
      description: destination.seo.description,
      url: siteUrl,
      siteName: destination.branding.logoText,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: destination.seo.ogImage,
          width: 1200,
          height: 630,
          alt: destination.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: destination.seo.title,
      description: destination.seo.description,
      images: [destination.seo.ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function HomePage() {
  const destination = await getDestinationConfig();
  const siteUrl = getSiteUrl(destination.domain);

  return <LandingPage destination={destination} siteUrl={siteUrl} />;
}
