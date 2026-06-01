import type { TravelPackage } from "@/types/destination";

/** e.g. "04 Nights / 05 Days" → "4N5D" */
export function durationToShort(duration: string): string {
  const match = duration.match(/(\d+)\s*Nights?\s*\/\s*(\d+)\s*Days?/i);
  if (match) {
    return `${Number(match[1])}N${Number(match[2])}D`;
  }
  return duration;
}

export function uniquePackageDurations(packages: TravelPackage[]): string[] {
  return [
    ...new Map(packages.map((p) => [p.duration, p.duration])).values(),
  ];
}

export function packagesByDuration(
  packages: TravelPackage[],
  duration: string
): TravelPackage[] {
  return packages.filter((p) => p.duration === duration);
}

export function packageSelectPrimary(pkg: TravelPackage): string {
  const short = durationToShort(pkg.duration);
  if (pkg.optionLabel) {
    return `${short} — ${pkg.optionLabel}`;
  }
  return pkg.title;
}

export function packageSelectSecondary(pkg: TravelPackage): string {
  return pkg.nightsBreakdown;
}
