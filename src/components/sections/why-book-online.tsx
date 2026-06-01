"use client";

import {
  Clock,
  HandCoins,
  HeartHandshake,
  ListChecks,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import type {
  DestinationConfig,
  WhyBookOnlineIcon,
} from "@/types/destination";

const iconMap: Record<WhyBookOnlineIcon, LucideIcon> = {
  time: Clock,
  options: ListChecks,
  money: HandCoins,
  trust: HeartHandshake,
};

interface WhyBookOnlineProps {
  destination: DestinationConfig;
}

export function WhyBookOnline({ destination }: WhyBookOnlineProps) {
  return (
    <section className="border-b border-gray-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionEyebrow label="Why Book With Us" />

        <h2 className="text-center text-2xl font-bold text-[#0c3d5c] sm:text-3xl lg:text-[2rem]">
          Why Book{" "}
          <span className="relative inline-block text-[#2a7da3]">
            Online
            <span
              className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-full bg-[#5eb8d9] sm:h-1.5"
              aria-hidden
            />
          </span>{" "}
          with Us
        </h2>

        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {destination.whyBookOnline.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.title} className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-[#2a7da3]/30 bg-[#2a7da3]/5">
                  <Icon
                    className="size-8 stroke-[1.5] text-[#2a7da3]"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-[#0c3d5c] sm:text-base">
                  {item.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[220px] text-xs leading-relaxed text-gray-600 sm:text-sm">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 flex justify-center sm:mt-14">
          <a
            href={siteConfig.phoneHref}
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-b from-[#3a9fc4] to-[#2a7da3] px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition hover:brightness-105 sm:px-8 sm:text-sm"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            Call Now for Customized {destination.shortName} Packages
          </a>
        </div>
      </div>
    </section>
  );
}
