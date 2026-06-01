import type { TravelPackage } from "@/types/destination";

const standardExclusions = [
  "All kind of personal expenses such as tips, laundry, telephone bills, beverages, etc.",
  "Domestic or International Airfare.",
  "Above package does not include any water activity, like scuba diving, seawalk etc.",
  "Any additional charges arising due to natural calamities, political disturbances, VIP movement, etc.",
  "Any kind of drinks (alcohol, mineral, aerated, bed tea on tour or any other snack while waiting at airport or waiting for jetty).",
  "Additional costs due to flight cancellation etc. Cost incidental to any change in the itinerary/stay on account of flight cancellation due to bad weather, ill health, and/or any factors beyond control.",
];

export const andamanPackages: TravelPackage[] = [
  {
    id: "andaman-4n5d-option-01",
    title: "Andaman 4N5D Tour Package",
    optionLabel: "Option 01",
    validity: "Valid till August 31st only",
    duration: "04 Nights / 05 Days",
    nightsBreakdown: "02 Nights Port Blair / 02 Nights Havelock",
    placesToVisit: "Port Blair, Havelock, Radhanagar Beach, Elephant Beach, Chidiyatapu",
    priceFrom: "12,650",
    pricingTiers: [
      { label: "For two adults", pricePerPerson: "15,000" },
      { label: "For four adults", pricePerPerson: "13,500" },
      { label: "For six adults", pricePerPerson: "12,650" },
    ],
    discountPercent: 25,
    amenities: ["hotels", "meals", "sightseeing", "transfers"],
    highlights: [
      "Cellular Jail & Light & Sound Show",
      "Radhanagar & Elephant Beach visits",
      "Private ferry Port – Havelock – Port",
    ],
    itinerary: [
      "Day 1: Arrival at the airport. Pickup and drop at the hotel. Later, visit Cellular Jail, Corbyn's Cove Beach and Light & Sound Show. Stay at Port Blair.",
      "Day 2: Depart for Havelock. Visit Radhanagar Beach. Stay at Havelock.",
      "Day 3: Visit Elephant Beach. Stay at Havelock.",
      "Day 4: Return to Port Blair. In the afternoon, visit Chidiyatapu for sunset view. Stay at Port Blair.",
      "Day 5: Drop at airport. Departure.",
    ],
    accommodations: [
      "Port Blair: Hotel GKM Grand or similar – AC Standard room (base category)",
      "Havelock: Hotel Shangrilas Beach Resort or similar – Deluxe room (base category)",
    ],
    inclusions: [
      "Accommodation for four nights on a double sharing basis.",
      "Complimentary breakfast from the hotel.",
      "Private AC vehicle for point-to-point basis only as per itinerary.",
      "Private ferry for Port – Havelock – Port.",
      "Entry fees and light & sound show.",
      "Boat charges for elephant beach.",
      "Complimentary snorkeling at elephant beach from boat association.",
    ],
    exclusions: standardExclusions,
    image: {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
      alt: "Andaman snorkelling at Elephant Beach",
    },
  },
  {
    id: "andaman-4n5d-option-02",
    title: "Andaman 4N5D Tour Package",
    optionLabel: "Option 02",
    validity: "Valid till August 31st only",
    duration: "04 Nights / 05 Days",
    nightsBreakdown:
      "02 Nights Port Blair / 01 Night Havelock / 01 Night Neil Island",
    placesToVisit:
      "Port Blair, Havelock, Neil Island, Radhanagar, Elephant Beach, Chidiyatapu",
    priceFrom: "13,500",
    pricingTiers: [
      { label: "For two adults", pricePerPerson: "16,250" },
      { label: "For four adults", pricePerPerson: "14,500" },
      { label: "For six adults", pricePerPerson: "13,500" },
    ],
    discountPercent: 25,
    amenities: ["hotels", "meals", "sightseeing", "transfers"],
    highlights: [
      "Neil Island – Bharatpur & Natural Bridge",
      "Radhanagar & Elephant Beach",
      "Chidiyatapu sunset experience",
    ],
    itinerary: [
      "Day 1: Arrival at the airport. Pickup and drop at the hotel. Later, visit Cellular Jail, Corbyn's Cove Beach and Light & Sound Show. Stay at Port Blair.",
      "Day 2: Depart for Havelock. Visit Radhanagar Beach & Elephant Beach. Stay at Havelock.",
      "Day 3: Depart for Neil Island. Visit Laxmanpur Beach, Bharatpur Beach and Natural Bridge. Stay on Neil Island.",
      "Day 4: Return to Port Blair. In the afternoon, visit Chidiyatapu for sunset view. Stay at Port Blair.",
      "Day 5: Drop at airport. Departure.",
    ],
    accommodations: [
      "Port Blair: Hotel GKM Grand or similar – AC Standard room (base category)",
      "Havelock: Hotel Shangrilas Beach Resort or similar – Deluxe room (base category)",
      "Neil Island: Hotel C S Empire or similar – Premium AC (base category)",
    ],
    inclusions: [
      "Accommodation for four nights on a double sharing basis.",
      "Complimentary breakfast from the hotel.",
      "Private AC vehicle for point-to-point basis only as per itinerary.",
      "Private ferry for Port – Havelock – Port.",
      "Entry fees and light & sound show.",
    ],
    exclusions: standardExclusions,
    image: {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
      alt: "Andaman beach and islands",
    },
  },
  {
    id: "andaman-5n6d",
    title: "Andaman 5N6D Tour Package",
    validity: "Valid till August 31st only",
    duration: "05 Nights / 06 Days",
    nightsBreakdown:
      "03 Nights Port Blair / 01 Night Havelock / 01 Night Neil Island",
    placesToVisit:
      "Port Blair, Ross Island, North Bay, Havelock, Neil Island, Chidiyatapu",
    priceFrom: "15,500",
    pricingTiers: [
      { label: "For two adults", pricePerPerson: "18,500" },
      { label: "For four adults", pricePerPerson: "16,500" },
      { label: "For six adults", pricePerPerson: "15,500" },
    ],
    discountPercent: 30,
    amenities: ["hotels", "meals", "sightseeing", "transfers"],
    highlights: [
      "Ross & North Bay Island tour",
      "Havelock & Neil Island stays",
      "3-star hotels with breakfast",
    ],
    itinerary: [
      "Day 1: Arrival at the airport. Pickup and drop at the hotel. Later, visit Cellular Jail, Corbyn's Cove Beach and Light & Sound Show. Stay at Port Blair.",
      "Day 2: Visit Ross & North Bay Island.",
      "Day 3: Depart for Havelock. Visit Radhanagar Beach. Stay at Havelock.",
      "Day 4: Depart for Neil Island. Visit Laxmanpur Beach, Bharatpur Beach and Natural Bridge. Stay on Neil Island.",
      "Day 5: Return to Port Blair. In the afternoon, visit Chidiyatapu for sunset view. Stay at Port Blair.",
      "Day 6: Drop at airport. Departure.",
    ],
    accommodations: [
      "Port Blair: Hotel GKM Grand or similar – AC Standard room (base category)",
      "Havelock: Hotel Shangrilas Beach Resort or similar – Deluxe room (base category)",
      "Neil Island: Hotel C S Empire or similar – Premium AC (base category)",
    ],
    inclusions: [
      "Accommodation for five nights on double sharing basis.",
      "Complimentary breakfast from hotel.",
      "Private AC vehicle for point to point basis only as per itinerary.",
      "Private ferry for Port – Havelock – Port.",
      "Entry fees and light & sound show.",
      "Boat charges for Ross & North Bay Island.",
    ],
    exclusions: standardExclusions,
    image: {
      src: "https://images.unsplash.com/photo-1586864387967-d02ef85d93ad?w=600&q=80",
      alt: "Andaman islands",
    },
  },
  {
    id: "andaman-6n7d",
    title: "Andaman 6N7D Tour Package",
    validity: "Valid till August 31st only",
    duration: "06 Nights / 07 Days",
    nightsBreakdown:
      "03 Nights Port Blair / 02 Nights Havelock / 01 Night Neil Island",
    placesToVisit:
      "Port Blair, Ross Island, North Bay, Havelock, Elephant Beach, Neil Island, Chidiyatapu",
    priceFrom: "18,500",
    pricingTiers: [
      { label: "For two adults", pricePerPerson: "21,500" },
      { label: "For four adults", pricePerPerson: "19,500" },
      { label: "For six adults", pricePerPerson: "18,500" },
    ],
    discountPercent: 30,
    amenities: ["hotels", "meals", "sightseeing", "transfers"],
    highlights: [
      "Elephant Beach with snorkeling",
      "Ross & North Bay Island",
      "Full island-hopping itinerary",
    ],
    itinerary: [
      "Day 1: Arrival at the airport. Pickup and drop at the hotel. Later, visit Cellular Jail, Corbyn's Cove Beach and Light & Sound Show. Stay at Port Blair.",
      "Day 2: Visit Ross & North Bay Island.",
      "Day 3: Depart for Havelock. Visit Radhanagar Beach. Stay at Havelock.",
      "Day 4: Visit Elephant Beach. Stay at Havelock.",
      "Day 5: Depart for Neil Island. Visit Laxmanpur Beach, Bharatpur Beach and Natural Bridge. Stay on Neil Island.",
      "Day 6: Return to Port Blair. Afternoon visit Chidiyatapu for sunset view. Stay at Port Blair.",
      "Day 7: Drop at airport. Departure.",
    ],
    accommodations: [
      "Port Blair: Hotel GKM Grand or similar – AC Standard room (base category)",
      "Havelock: Hotel Shangrilas Beach Resort or similar – Deluxe room (base category)",
      "Neil Island: Hotel C S Empire or similar – Premium AC (base category)",
    ],
    inclusions: [
      "Accommodation for six nights on double sharing basis.",
      "Complimentary breakfast from hotel.",
      "Private AC vehicle for point to point basis only as per itinerary.",
      "Private ferry for Port – Havelock – Port.",
      "Entry fees and light & sound show.",
      "Boat charges for elephant beach and Ross & North bay.",
      "Complimentary snorkeling at elephant beach from boat association.",
    ],
    exclusions: standardExclusions,
    image: {
      src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
      alt: "Andaman tour experience",
    },
  },
];
