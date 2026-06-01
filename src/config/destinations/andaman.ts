import { buildWhyChooseUs, whyBookOnlineItems } from "@/config/site";
import { andamanPackages } from "@/config/destinations/andaman-packages";
import type { DestinationConfig } from "@/types/destination";

export const andamanConfig: DestinationConfig = {
  slug: "andaman",
  domain: "bookandaman.in",
  name: "Andaman & Nicobar Islands",
  shortName: "Andaman",
  pageTitle: "Andaman Tour Packages",
  hero: {
    accentTagline: "Discover Paradise",
    subheading:
      "Pristine Beaches. Turquoise Waters. Unforgettable Memories.",
    places: [
      "Port Blair",
      "Havelock Island",
      "Neil Island",
      "Ross Island",
      "Baratang Island",
      "North Bay Island",
    ],
    placesSuffix: "& more",
    features: [
      { label: "Best Price Guarantee", icon: "price" },
      { label: "Customizable Packages", icon: "custom" },
      { label: "24/7 Travel Support", icon: "support" },
    ],
    trust: {
      count: "10,000+",
      label: "Trusted by 10,000+ Travelers",
    },
    formSubtitle: "Plan your perfect Andaman trip",
    image: {
      src: "/assets/images/index/banner.jpg",
      alt: "Aerial view of Andaman Islands turquoise waters and tropical coastline",
    },
  },
  about: {
    paragraphs: [
      "The Andaman & Nicobar Islands are a tropical paradise in the Bay of Bengal, known for turquoise waters, coral reefs, and rich colonial history. Often called the **Jewel of the Bay of Bengal**, this archipelago offers pristine beaches, vibrant marine life, and unforgettable island experiences.",
      "From the white sands of Radhanagar to the limestone caves of Baratang, every island has something unique. Whether you seek adventure diving, a romantic honeymoon, or a family holiday, our curated packages cover ferries, permits, hotels, and guided experiences — so you travel stress-free with the best value.",
    ],
  },
  branding: {
    logoText: "Exotic Yatra - Andaman Package",
    accentClass: "destination-andaman",
  },
  seo: {
    title: "Andaman Tour Packages | Exotic Yatra",
    description:
      "Book Andaman tour packages — Port Blair, Havelock, Neil Island. 3-star stays, ferries & sightseeing included. Get free quotes.",
    keywords: [
      "andaman tour packages",
      "andaman 4 nights 5 days package",
      "havelock island tour",
      "port blair tour package",
    ],
    ogImage:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93ad?w=1200&q=80",
  },
  whyChooseUs: buildWhyChooseUs("Andaman Tour Packages"),
  whyBookOnline: [...whyBookOnlineItems],
  packages: andamanPackages,
};
