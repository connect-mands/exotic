import type { TravelPackage } from "@/types/destination";

export function getPackageById(
  packages: TravelPackage[],
  id: string
): TravelPackage | undefined {
  return packages.find((p) => p.id === id);
}
