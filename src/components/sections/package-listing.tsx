"use client";

import Image from "next/image";
import {
  ArrowRight,
  Bus,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Hotel,
  MapPin,
  Plane,
  Utensils,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { useEnquiryDialog } from "@/context/enquiry-dialog-context";
import { SectionTitle } from "@/components/ui/section-title";
import { PackageDetailDialog } from "@/components/sections/package-detail-dialog";
import type {
  DestinationConfig,
  PackageAmenity,
  TravelPackage,
} from "@/types/destination";

const ALL_AMENITIES: PackageAmenity[] = [
  "flight",
  "hotels",
  "sightseeing",
  "meals",
  "transfers",
];

const amenityConfig: Record<
  PackageAmenity,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  flight: { label: "Flight", icon: Plane },
  hotels: { label: "Hotels", icon: Hotel },
  sightseeing: { label: "Sightseeing", icon: Camera },
  meals: { label: "Meals", icon: Utensils },
  transfers: { label: "Transfers", icon: Bus },
};

function formatRoute(places: string): string {
  return places
    .split(/\s*[-–,]\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" • ");
}

function PackageCard({
  pkg,
  fallbackImage,
  onQuote,
  onViewDetails,
}: {
  pkg: TravelPackage;
  fallbackImage: string;
  onQuote: (id: string) => void;
  onViewDetails: (pkg: TravelPackage) => void;
}) {
  const imageSrc = pkg.image?.src ?? fallbackImage;
  const imageAlt = pkg.image?.alt ?? pkg.title;
  const route = formatRoute(pkg.placesToVisit);
  const displayTitle = pkg.optionLabel
    ? `${pkg.title} – ${pkg.optionLabel}`
    : pkg.title;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {pkg.discountPercent != null && (
          <div
            className="absolute right-0 top-0 z-10 bg-[#1e5f7a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-md"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 12% 100%)",
            }}
          >
            {pkg.discountPercent}% OFF
          </div>
        )}
        <div
          className="absolute -bottom-4 left-4 z-10 flex size-11 items-center justify-center rounded-lg border border-gray-100 bg-white shadow-md"
          aria-hidden
        >
          <CalendarDays className="size-5 text-[#2a7da3]" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-6 sm:px-5 sm:pb-5">
        <h3 className="text-[15px] font-bold leading-snug text-gray-900 sm:text-base">
          {displayTitle}
        </h3>

        <div className="mt-2.5 space-y-1.5 text-xs text-gray-500">
          <p className="flex items-start gap-2">
            <CalendarDays
              className="mt-0.5 size-3.5 shrink-0 text-[#2a7da3]"
              aria-hidden
            />
            <span>
              {pkg.duration}
              {pkg.nightsBreakdown ? (
                <span className="block text-[11px] text-gray-400">
                  ({pkg.nightsBreakdown})
                </span>
              ) : null}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 size-3.5 shrink-0 text-[#2a7da3]"
              aria-hidden
            />
            <span className="leading-relaxed">{route}</span>
          </p>
        </div>

        <ul
          className="mt-4 grid grid-cols-5 gap-1 border-y border-gray-100 py-3"
          aria-label="Package inclusions"
        >
          {ALL_AMENITIES.map((key) => {
            const included = pkg.amenities.includes(key);
            const { label, icon: Icon } = amenityConfig[key];
            return (
              <li
                key={key}
                className={`flex flex-col items-center gap-1 text-center ${
                  included ? "text-gray-700" : "text-gray-300"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="text-[9px] font-medium leading-tight sm:text-[10px]">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>

        <ul className="mt-3 space-y-1.5">
          {pkg.highlights.slice(0, 3).map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-xs leading-relaxed text-gray-600"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-[#2a7da3]"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onViewDetails(pkg)}
          className="mt-3 inline-flex w-fit items-center gap-1 text-xs font-semibold text-[#2a7da3] transition-colors hover:text-[#1e5f7a]"
        >
          Read full details
          <ChevronDown className="size-3.5" aria-hidden />
        </button>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Starting from
            </p>
            <p className="text-xl font-bold text-[#2a7da3] sm:text-2xl">
              ₹{pkg.priceFrom}/-
            </p>
            <p className="text-[10px] text-gray-400">per person</p>
          </div>
          <button
            type="button"
            onClick={() => onQuote(pkg.id)}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#2a7da3] px-3.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-[#1e5f7a] sm:h-11 sm:px-4 sm:text-xs"
          >
            Get Free Quote
            <ArrowRight className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

interface PackageListingProps {
  destination: DestinationConfig;
}

export function PackageListing({ destination }: PackageListingProps) {
  const { openDialog } = useEnquiryDialog();
  const [detailPackage, setDetailPackage] = useState<TravelPackage | null>(null);
  const fallbackImage = destination.hero.image.src;

  return (
    <section id="packages" className="scroll-mt-4 bg-slate-50/60 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10">
          <SectionTitle
            title="Our Best Selling Tour Packages"
            showDivider
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {destination.packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              fallbackImage={fallbackImage}
              onQuote={(id) => openDialog(id)}
              onViewDetails={setDetailPackage}
            />
          ))}
        </div>
      </div>

      <PackageDetailDialog
        pkg={detailPackage}
        open={!!detailPackage}
        onOpenChange={(open) => !open && setDetailPackage(null)}
        onGetQuote={(id) => openDialog(id)}
      />
    </section>
  );
}
