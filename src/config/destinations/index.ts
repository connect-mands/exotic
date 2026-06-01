import { andamanConfig } from "@/config/destinations/andaman";
import { keralaConfig } from "@/config/destinations/kerala";
import type { DestinationConfig, DestinationSlug } from "@/types/destination";

export { getPackageById } from "@/config/destinations/helpers";

export const destinations: Record<DestinationSlug, DestinationConfig> = {
  andaman: andamanConfig,
  kerala: keralaConfig,
};

export const destinationList = Object.values(destinations);

export const domainToSlug: Record<string, DestinationSlug> = {
  "bookandaman.in": "andaman",
  "www.bookandaman.in": "andaman",
  "bookkeralapackage.in": "kerala",
  "www.bookkeralapackage.in": "kerala",
  localhost: "andaman",
  "127.0.0.1": "andaman",
};

export const destinationOptions = destinationList.map((d) => ({
  value: d.slug,
  label: d.name,
}));

export function getDestinationBySlug(
  slug: string | undefined
): DestinationConfig {
  if (slug && slug in destinations) {
    return destinations[slug as DestinationSlug];
  }
  return andamanConfig;
}
