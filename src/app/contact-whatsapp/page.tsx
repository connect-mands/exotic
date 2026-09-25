import type { Metadata } from "next";
import { ContactWhatsAppPage } from "@/components/pages/contact-whatsapp-page";
import { getDestinationConfig } from "@/lib/get-destination";

function getSiteUrl(domain: string): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? `https://${domain}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const destination = await getDestinationConfig();
  const siteUrl = getSiteUrl(destination.domain);
  const title = `Chat with us on WhatsApp | ${destination.shortName}`;
  const description = `Message our ${destination.shortName} travel expert on WhatsApp for itinerary, pricing and the best package.`;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: `${siteUrl}/contact-whatsapp` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/contact-whatsapp`,
      siteName: destination.branding.logoText,
      locale: "en_IN",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function ContactWhatsAppRoute() {
  const destination = await getDestinationConfig();
  return <ContactWhatsAppPage destination={destination} />;
}
