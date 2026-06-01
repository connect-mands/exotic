export type DestinationSlug = "andaman" | "kerala";

export type PackageAmenity =
  | "flight"
  | "hotels"
  | "sightseeing"
  | "meals"
  | "transfers";

export interface PackagePricingTier {
  label: string;
  pricePerPerson: string;
}

export interface TravelPackage {
  id: string;
  title: string;
  duration: string;
  placesToVisit: string;
  nightsBreakdown: string;
  validity?: string;
  optionLabel?: string;
  discountPercent?: number;
  /** Lowest per-person price — shown on cards (e.g. six adults) */
  priceFrom: string;
  pricingTiers: PackagePricingTier[];
  amenities: PackageAmenity[];
  /** Short bullet highlights shown on package cards */
  highlights: string[];
  itinerary: string[];
  accommodations: string[];
  inclusions: string[];
  exclusions: string[];
  image?: {
    src: string;
    alt: string;
  };
}

export type WhyChooseIcon =
  | "badge"
  | "map"
  | "b2b"
  | "value"
  | "custom"
  | "personal";

export interface WhyChooseItem {
  icon: WhyChooseIcon;
  label: string;
}

export type WhyBookOnlineIcon = "time" | "options" | "money" | "trust";

export interface WhyBookOnlineItem {
  title: string;
  description: string;
  icon: WhyBookOnlineIcon;
}

export interface DestinationConfig {
  slug: DestinationSlug;
  domain: string;
  name: string;
  shortName: string;
  pageTitle: string;
  hero: {
    accentTagline: string;
    subheading: string;
    places: string[];
    placesSuffix?: string;
    features: {
      label: string;
      icon: "price" | "custom" | "support";
    }[];
    trust: {
      count: string;
      label: string;
    };
    formSubtitle: string;
    image: {
      src: string;
      alt: string;
    };
  };
  about: {
    paragraphs: string[];
  };
  branding: {
    logoText: string;
    accentClass: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  whyChooseUs: WhyChooseItem[];
  whyBookOnline: WhyBookOnlineItem[];
  packages: TravelPackage[];
}
