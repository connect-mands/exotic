import type { WhyChooseItem } from "@/types/destination";

/** Shared business contact — same across all destination landings */
export const siteConfig = {
  brandName: "Exotic Yatra",
  logo: {
    src: "/assets/images/logo/logo-main.png",
    width: 145,
    height: 61,
  },
  phone: "+91 91477 52663",
  phoneHref: "tel:+919147752663",
  whatsappHref: "https://wa.me/919147752663",
  email: "query@exoticyatra.com",
  emailHref: "mailto:query@exoticyatra.com",
  enquiryRecipient: "query@exoticyatra.com",
} as const;

export function buildWhyChooseUs(
  destinationLabel: string
): WhyChooseItem[] {
  return [
    {
      icon: "badge",
      label: "Approved by Ministry of Tourism, Government of India",
    },
    {
      icon: "map",
      label: `Trusted name in ${destinationLabel}`,
    },
    {
      icon: "b2b",
      label: "Best B to B Service Provider",
    },
    {
      icon: "value",
      label: "Value for Money Packages",
    },
    {
      icon: "custom",
      label: "Customized Solutions",
    },
    {
      icon: "personal",
      label: "Personalized Services",
    },
  ];
}

export const whyBookOnlineItems = [
  {
    icon: "time",
    title: "Save Time",
    description:
      "No need to surf multiple sites for packages, quotes, and travel plans",
  },
  {
    icon: "options",
    title: "Multiple Options",
    description:
      "Get multiple itineraries and personalised suggestions from our travel agents",
  },
  {
    icon: "money",
    title: "Save Money",
    description:
      "Compare, negotiate and choose the best from multiple options",
  },
  {
    icon: "trust",
    title: "Trusted Network",
    description:
      "2000+ hotels — reliable and authentic travel guides across India",
  },
] as const;

export const footerGuaranteeItems = [
  "100% Trust",
  "100% Support",
  "100% Value for Money",
  "100% Online Security",
] as const;

export const footerTrustBarItems = [
  {
    title: "Best Price Guarantee",
    description: "We ensure best price for you",
  },
  {
    title: "24/7 Travel Support",
    description: "We are always here to help you",
  },
  {
    title: "Secure & Easy Booking",
    description: "Your booking is 100% safe",
  },
  {
    title: "1000+ Happy Travelers",
    description: "Trusted by thousands of travelers",
  },
] as const;

export const certificationAssets = {
  logos: "/assets/images/certifications/logos.png",
  trust: "/assets/images/certifications/trust.png",
} as const;
