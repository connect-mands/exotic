"use client";

import { EnquiryForm } from "@/components/forms/enquiry-form";
import { QuoteFormCard } from "@/components/forms/quote-form-card";
import type { DestinationConfig } from "@/types/destination";

interface HeroQuoteCardProps {
  destination: DestinationConfig;
  defaultPackageId?: string;
}

export function HeroQuoteCard({
  destination,
  defaultPackageId,
}: HeroQuoteCardProps) {
  return (
    <div className="w-full shrink-0 justify-self-end sm:min-w-[416px] sm:w-[416px] sm:max-w-[416px]">
      <QuoteFormCard subtitle={destination.hero.formSubtitle}>
        <EnquiryForm
          formId="hero"
          destination={destination}
          defaultPackageId={defaultPackageId}
          variant="hero"
        />
      </QuoteFormCard>
    </div>
  );
}
