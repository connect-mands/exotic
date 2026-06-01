"use client";

import {
  Award,
  Handshake,
  MapPin,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import { RichText } from "@/components/ui/rich-text";
import { BestPriceSeal } from "@/components/sections/best-price-seal";
import { useEnquiryDialog } from "@/context/enquiry-dialog-context";
import type { DestinationConfig, WhyChooseIcon } from "@/types/destination";

const whyIconMap: Record<WhyChooseIcon, LucideIcon> = {
  badge: Award,
  map: MapPin,
  b2b: Handshake,
  value: Wallet,
  custom: Settings,
  personal: Users,
};

interface AboutWhySectionProps {
  destination: DestinationConfig;
}

export function AboutWhySection({ destination }: AboutWhySectionProps) {
  const { openDialog } = useEnquiryDialog();

  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-white py-12 sm:py-14">
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* About — left */}
          <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl">
              <span className="text-gray-900">About </span>
              <span className="text-[#2a7da3]">{destination.shortName}</span>
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
              {destination.about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => openDialog()}
                className="about-cta-button inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white sm:text-sm"
              >
                Call Now for customized packages
              </button>
              <p className="mt-3 text-sm text-gray-600">
                Or call{" "}
                <a
                  href={siteConfig.phoneHref}
                  className="font-semibold text-[#2a7da3] hover:underline"
                >
                  {siteConfig.phone}
                </a>
              </p>
            </div>
          </div>

          {/* Why Us — right */}
          <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl">
              <span className="text-gray-900">Why </span>
              <span className="text-[#2a7da3]">Us</span>
            </h2>

            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-y-10">
              {destination.whyChooseUs.map((item) => {
                const Icon = whyIconMap[item.icon];
                return (
                  <li
                    key={item.label}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="mb-3 flex size-12 items-center justify-center text-[#2a7da3]">
                      <Icon
                        className="size-9 stroke-[1.35]"
                        aria-hidden
                      />
                    </div>
                    <p className="text-xs font-bold leading-snug text-gray-900 sm:text-[13px]">
                      {item.label}
                    </p>
                  </li>
                );
              })}
            </ul>

            <BestPriceSeal />
          </div>
        </div>
      </div>
    </section>
  );
}
