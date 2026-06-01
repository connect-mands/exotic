"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { QuoteFormCard } from "@/components/forms/quote-form-card";
import { useEnquiryDialog } from "@/context/enquiry-dialog-context";
import type { DestinationConfig } from "@/types/destination";

interface EnquiryDialogProps {
  destination: DestinationConfig;
}

export function EnquiryDialog({ destination }: EnquiryDialogProps) {
  const { open, setOpen, selectedPackageId } = useEnquiryDialog();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] min-w-0 max-w-[calc(100%-2rem)] overflow-visible border-0 bg-transparent p-0 shadow-none sm:min-w-[416px] sm:max-w-[416px]">
        <QuoteFormCard
          subtitle={destination.hero.formSubtitle}
          className="max-h-[90vh] overflow-y-auto"
        >
          {open ? (
            <EnquiryForm
              key={selectedPackageId ?? "popup-default"}
              formId="popup"
              destination={destination}
              defaultPackageId={selectedPackageId}
              variant="hero"
              stackPackageDropdowns
            />
          ) : null}
        </QuoteFormCard>
      </DialogContent>
    </Dialog>
  );
}
