"use client";

import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TravelPackage } from "@/types/destination";

interface PackageDetailDialogProps {
  pkg: TravelPackage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetQuote: (packageId: string) => void;
}

function formatRoute(places: string): string {
  return places
    .split(/\s*[-–,]\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" • ");
}

export function PackageDetailDialog({
  pkg,
  open,
  onOpenChange,
  onGetQuote,
}: PackageDetailDialogProps) {
  if (!pkg) return null;

  const displayTitle = pkg.optionLabel
    ? `${pkg.title} – ${pkg.optionLabel}`
    : pkg.title;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(90vh,720px)] w-[min(calc(100vw-1.5rem),42rem)] max-w-none flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl ring-gray-200"
      >
        <div className="relative h-36 shrink-0 overflow-hidden bg-slate-200 sm:h-44">
          {pkg.image?.src ? (
            <Image
              src={pkg.image.src}
              alt={pkg.image.alt}
              fill
              className="object-cover"
              sizes="720px"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-[#2a7da3] to-[#1e5f7a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md transition hover:bg-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8 text-white">
            <DialogTitle className="text-left text-lg font-bold leading-tight text-white sm:text-xl">
              {displayTitle}
            </DialogTitle>
            {pkg.validity && (
              <p className="mt-1 inline-block rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-semibold">
                {pkg.validity}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 border-b border-gray-100 bg-[#f8fafc] px-5 py-3 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-[#2a7da3]" aria-hidden />
            {pkg.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-[#2a7da3]" aria-hidden />
            {formatRoute(pkg.placesToVisit)}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2a7da3]">
                Day-wise itinerary
              </h3>
              <ol className="mt-3 space-y-3">
                {pkg.itinerary.map((day, index) => (
                  <li
                    key={day}
                    className="flex gap-3 text-sm leading-relaxed text-gray-700"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2a7da3]/10 text-xs font-bold text-[#2a7da3]">
                      {index + 1}
                    </span>
                    <span>{day.replace(/^Day \d+:\s*/i, "")}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2a7da3]">
                Package cost (per person)
              </h3>
              <ul className="mt-3 divide-y divide-gray-200/80">
                {pkg.pricingTiers.map((tier) => (
                  <li
                    key={tier.label}
                    className="flex justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="text-gray-600">{tier.label}</span>
                    <span className="font-bold text-gray-900">
                      ₹{tier.pricePerPerson}/-
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-gray-500">
                {pkg.nightsBreakdown}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2a7da3]">
                Accommodation (3 Star)
              </h3>
              <ul className="mt-3 space-y-2">
                {pkg.accommodations.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-sm text-gray-700"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[#2a7da3]"
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-green-100 bg-green-50/50 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-800">
                  Inclusions
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {pkg.inclusions.map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-green-600"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-red-100 bg-red-50/30 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-800">
                  Exclusions
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {pkg.exclusions.map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span
                        className="mt-0.5 shrink-0 text-red-500"
                        aria-hidden
                      >
                        ✗
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 bg-white px-5 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Starting from
            </p>
            <p className="text-xl font-bold text-[#2a7da3]">
              ₹{pkg.priceFrom}/-{" "}
              <span className="text-xs font-normal text-gray-500">PP</span>
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onGetQuote(pkg.id);
            }}
            className="h-11 shrink-0 rounded-lg bg-[#2a7da3] px-5 text-xs font-bold uppercase tracking-wide hover:bg-[#1e5f7a]"
          >
            Get Free Quote
            <ArrowRight className="ml-1.5 size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
