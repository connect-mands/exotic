import Image from "next/image";
import {
  BadgePercent,
  Headphones,
  MapPin,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import type { DestinationConfig } from "@/types/destination";

const featureIcons = {
  price: BadgePercent,
  custom: SlidersHorizontal,
  support: Headphones,
} as const;

const TRUST_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
];

interface HeroLeftContentProps {
  destination: DestinationConfig;
}

export function HeroLeftContent({ destination }: HeroLeftContentProps) {
  const { hero } = destination;
  const destinationsText = [
    hero.places.join(" • "),
    hero.placesSuffix,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex max-w-2xl flex-col justify-center text-white">
      <p className="font-script text-4xl leading-none text-sky-300 drop-shadow-sm sm:text-5xl lg:text-[3.25rem]">
        {hero.accentTagline}
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight drop-shadow-md sm:text-4xl lg:text-5xl lg:leading-[1.15]">
        {destination.pageTitle}
      </h1>

      <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/95 drop-shadow sm:text-lg">
        {hero.subheading}
      </p>

      <ul className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
        {hero.features.map((feature) => {
          const Icon = featureIcons[feature.icon];
          return (
            <li
              key={feature.label}
              className="flex items-center gap-2.5 text-sm font-medium text-white/95"
            >
              <Icon
                className="size-5 shrink-0 stroke-[1.5] text-white"
                aria-hidden
              />
              <span>{feature.label}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex gap-3 rounded-xl border border-white/10 bg-[#0d4f5c]/75 px-4 py-4 shadow-lg backdrop-blur-sm sm:px-5 sm:py-4">
        <MapPin
          className="mt-0.5 size-5 shrink-0 text-sky-300"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-white/95 sm:text-[0.95rem]">
          {destinationsText}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          {TRUST_AVATARS.map((src, index) => (
            <div
              key={src}
              className="relative size-10 overflow-hidden rounded-full border-2 border-white shadow-md"
              style={{ marginLeft: index === 0 ? 0 : -10, zIndex: 10 - index }}
            >
              <Image
                src={src}
                alt="Happy traveler"
                width={40}
                height={40}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
        <div>
          <div className="flex gap-0.5" aria-label="5 star rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="size-4 fill-amber-400 text-amber-400"
                aria-hidden
              />
            ))}
          </div>
          <p className="mt-1 text-sm font-medium text-white/90">
            {hero.trust.label}
          </p>
        </div>
      </div>
    </div>
  );
}
