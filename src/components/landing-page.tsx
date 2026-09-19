import { EnquiryDialog } from "@/components/forms/enquiry-dialog";
import { WhatsAppLeadDialog } from "@/components/forms/whatsapp-lead-dialog";
import { FloatingContact } from "@/components/layout/floating-contact";
import { Footer } from "@/components/layout/footer";
import { MobileStickyCTA } from "@/components/layout/mobile-sticky-cta";
import { SiteHeader } from "@/components/layout/site-header";
import { VerticalQuoteTab } from "@/components/layout/vertical-quote-tab";
import { AboutWhySection } from "@/components/sections/about-why-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PackageListing } from "@/components/sections/package-listing";
import { WhyBookOnline } from "@/components/sections/why-book-online";
import { StructuredData } from "@/components/seo/structured-data";
import { EnquiryDialogProvider } from "@/context/enquiry-dialog-context";
import type { DestinationConfig } from "@/types/destination";

interface LandingPageProps {
  destination: DestinationConfig;
  siteUrl: string;
}

export function LandingPage({ destination, siteUrl }: LandingPageProps) {
  return (
    <EnquiryDialogProvider destinationLabel={destination.shortName}>
      <StructuredData destination={destination} url={siteUrl} />
      <div
        className={`bhutan-theme ${destination.branding.accentClass}`}
        data-destination={destination.slug}
      >
        <SiteHeader />
        <main className="pb-16 md:pb-0">
          <HeroSection destination={destination} />
          <AboutWhySection destination={destination} />
          <PackageListing destination={destination} />
          <WhyBookOnline destination={destination} />
        </main>
        <Footer destination={destination} />
        <FloatingContact />
        <VerticalQuoteTab />
        <MobileStickyCTA />
        <EnquiryDialog destination={destination} />
        <WhatsAppLeadDialog destination={destination} />
      </div>
    </EnquiryDialogProvider>
  );
}
