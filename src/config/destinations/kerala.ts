import { buildWhyChooseUs, whyBookOnlineItems } from "@/config/site";
import type { DestinationConfig, TravelPackage } from "@/types/destination";

const keralaExclusions = [
  "Personal expenses, tips, laundry, telephone bills, and beverages.",
  "Domestic or international airfare unless specified.",
  "Entry fees and activities not mentioned in inclusions.",
  "Any cost arising from natural calamities, political disturbances, or force majeure.",
];

function keralaPackage(
  base: Omit<
    TravelPackage,
    "inclusions" | "exclusions" | "pricingTiers" | "highlights"
  > & {
    highlights: string[];
    pricingNote?: string;
  }
): TravelPackage {
  return {
    ...base,
    pricingTiers: [
      {
        label: "Package price from",
        pricePerPerson: base.priceFrom,
      },
    ],
    inclusions: [
      "Accommodation on double sharing basis.",
      "Breakfast as per hotel plan.",
      "Private vehicle for sightseeing as per itinerary.",
      "Driver allowance, tolls and parking.",
    ],
    exclusions: keralaExclusions,
  };
}

export const keralaConfig: DestinationConfig = {
  slug: "kerala",
  domain: "bookkeralapackage.in",
  name: "Kerala",
  shortName: "Kerala",
  pageTitle: "Kerala Tour Packages",
  hero: {
    accentTagline: "God's Own Country",
    subheading:
      "Backwaters. Misty Hills. Culture-rich journeys you'll cherish forever.",
    places: [
      "Munnar",
      "Alleppey",
      "Kochi",
      "Thekkady",
      "Wayanad",
      "Kovalam",
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
    formSubtitle: "Plan your perfect Kerala trip",
    image: {
      src: "https://images.unsplash.com/photo-1602219225920-34e6893cddb7?w=1920&q=80",
      alt: "Kerala backwaters houseboat",
    },
  },
  about: {
    paragraphs: [
      "Kerala — **God's Own Country** — blends misty hill stations, serene backwaters, wildlife sanctuaries, and golden beaches along the Arabian Sea. Ayurveda, Kathakali, and spice plantations add depth to every journey.",
      "Our Kerala packages include houseboat cruises, private transfers, handpicked hotels, and local guides — whether you plan a honeymoon, family trip, or group tour.",
    ],
  },
  branding: {
    logoText: "Exotic Yatra - Kerala Package",
    accentClass: "destination-kerala",
  },
  seo: {
    title: "Kerala Tour Packages | Exotic Yatra",
    description:
      "Book Kerala tour packages — Munnar, Alleppey houseboat, Kochi. Lowest price guaranteed. Get free quotes.",
    keywords: [
      "kerala tour packages",
      "alleppey houseboat package",
      "munnar tour package",
    ],
    ogImage:
      "https://images.unsplash.com/photo-1602219225920-34e6893cddb7?w=1200&q=80",
  },
  whyChooseUs: buildWhyChooseUs("Kerala Tour Packages"),
  whyBookOnline: [...whyBookOnlineItems],
  packages: [
    keralaPackage({
      id: "kerala-4n5d",
      title: "Best of Kerala 4 Nights & 5 Days",
      duration: "04 Nights / 05 Days",
      nightsBreakdown: "02 Nights Munnar / 01 Night Alleppey / 01 Night Kochi",
      placesToVisit: "Munnar - Alleppey - Kochi",
      discountPercent: 25,
      priceFrom: "16,999",
      highlights: [
        "Munnar tea estates & hill views",
        "Alleppey houseboat with meals",
        "Fort Kochi heritage walk",
      ],
      amenities: ["hotels", "sightseeing", "meals", "transfers"],
      accommodations: [
        "Munnar: 3-star resort or similar",
        "Alleppey: Houseboat / backwater resort",
        "Kochi: 3-star hotel or similar",
      ],
      itinerary: [
        "Day 1: Arrive Kochi. Drive to Munnar via spice plantations. Overnight Munnar.",
        "Day 2: Munnar sightseeing — tea museum, Mattupetty, Echo Point.",
        "Day 3: Drive to Alleppey. Houseboat cruise with lunch and dinner on board.",
        "Day 4: Disembark. Fort Kochi heritage walk — Chinese nets, synagogue.",
        "Day 5: Departure from Kochi.",
      ],
      image: {
        src: "https://images.unsplash.com/photo-1593693393818-7e5e05967c40?w=600&q=80",
        alt: "Munnar tea plantations",
      },
    }),
    keralaPackage({
      id: "kerala-5n6d",
      title: "Kerala Tour 5 Nights & 6 Days",
      duration: "05 Nights / 06 Days",
      nightsBreakdown: "02 Nights Munnar / 01 Night Thekkady / 01 Night Alleppey / 01 Night Kochi",
      placesToVisit: "Munnar - Thekkady - Alleppey",
      discountPercent: 30,
      priceFrom: "21,299",
      highlights: [
        "Periyar wildlife boat safari",
        "Munnar & Thekkady hill circuit",
        "Alleppey houseboat overnight",
      ],
      amenities: ["hotels", "sightseeing", "meals", "transfers"],
      accommodations: [
        "Munnar, Thekkady & Alleppey: 3-star hotels or similar",
      ],
      itinerary: [
        "Day 1: Kochi to Munnar. Tea estate visit.",
        "Day 2: Munnar local sightseeing.",
        "Day 3: Munnar to Thekkady. Periyar boat safari.",
        "Day 4: Thekkady to Alleppey houseboat.",
        "Day 5: Alleppey to Kochi. Beach time at Marari optional.",
        "Day 6: Departure.",
      ],
      image: {
        src: "https://images.unsplash.com/photo-1602219225920-34e6893cddb7?w=600&q=80",
        alt: "Kerala backwaters",
      },
    }),
    keralaPackage({
      id: "kerala-7n8d",
      title: "Best Of Kerala Tour 7 Days & 8 Nights",
      duration: "07 Nights / 08 Days",
      nightsBreakdown: "Munnar · Thekkady · Alleppey · Kovalam",
      placesToVisit: "Munnar - Thekkady - Alleppey - Kovalam",
      discountPercent: 25,
      priceFrom: "29,499",
      highlights: [
        "Premium houseboat experience",
        "Wildlife & spice plantation tours",
        "Kovalam beach resort stay",
      ],
      amenities: ["flight", "hotels", "sightseeing", "meals", "transfers"],
      accommodations: [
        "Multi-city 3-star hotels and houseboat as per itinerary",
      ],
      itinerary: [
        "Day 1–2: Munnar hill station experience.",
        "Day 3–4: Thekkady wildlife and spice garden.",
        "Day 5: Alleppey premium houseboat overnight.",
        "Day 6–7: Kovalam beach resort relaxation.",
        "Day 8: Trivandrum departure.",
      ],
      image: {
        src: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80",
        alt: "Kerala wildlife and hills",
      },
    }),
    keralaPackage({
      id: "kerala-honeymoon",
      title: "Kerala: Where Culture and Nature Dance",
      duration: "06 Nights / 07 Days",
      nightsBreakdown: "02 Nights Munnar / 02 Nights Kumarakom / 02 Nights Kochi",
      placesToVisit: "Munnar - Alleppey - Kumarakom",
      discountPercent: 30,
      priceFrom: "34,999",
      highlights: [
        "Honeymoon suite upgrades",
        "Luxury houseboat candle-light dinner",
        "Private tea estate & spa experiences",
      ],
      amenities: ["hotels", "sightseeing", "meals", "transfers"],
      accommodations: [
        "Honeymoon suite upgrades at selected properties",
      ],
      itinerary: [
        "Day 1: Arrive Kochi. Transfer to Munnar with honeymoon suite upgrade.",
        "Day 2: Private tea estate tour and sunset point.",
        "Day 3: Drive to Kumarakom. Lakeside resort with couple spa.",
        "Day 4–5: Luxury houseboat with candle-light dinner on deck.",
        "Day 6: Kochi sunset cruise.",
        "Day 7: Departure.",
      ],
      image: {
        src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
        alt: "Kerala honeymoon backwaters",
      },
    }),
  ],
};
