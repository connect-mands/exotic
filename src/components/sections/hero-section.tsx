import { HeroQuoteCard } from "@/components/forms/hero-quote-card";
import { HeroLeftContent } from "@/components/sections/hero-left-content";
import type { DestinationConfig } from "@/types/destination";

interface HeroSectionProps {
  destination: DestinationConfig;
}

export function HeroSection({ destination }: HeroSectionProps) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 min-h-[600px] lg:min-h-[640px]">
        <img
          src={destination.hero.image.src}
          alt={destination.hero.image.alt}
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
      </div>

      <div className="relative mx-auto grid min-h-[600px] max-w-7xl gap-10 px-4 py-10 lg:min-h-[640px] lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8 lg:px-6 lg:py-12">
        <HeroLeftContent destination={destination} />
        <HeroQuoteCard destination={destination} />
      </div>
    </section>
  );
}
