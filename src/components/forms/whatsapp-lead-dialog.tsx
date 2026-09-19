"use client";

import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEnquiryDialog } from "@/context/enquiry-dialog-context";
import type { DestinationConfig } from "@/types/destination";

interface WhatsAppLeadDialogProps {
  destination: DestinationConfig;
}

export function WhatsAppLeadDialog({ destination }: WhatsAppLeadDialogProps) {
  const {
    whatsAppOpen,
    onWhatsAppOpenChange,
    onWhatsAppChat,
    onWhatsAppLater,
  } = useEnquiryDialog();

  const article = /^[aeiou]/i.test(destination.shortName) ? "an" : "a";

  return (
    <Dialog open={whatsAppOpen} onOpenChange={onWhatsAppOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-[400px] [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:hover:bg-white/15">
        <div className="quote-form-card overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
          <div className="quote-form-card-header flex items-center gap-3 px-5 py-4">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25"
              aria-hidden
            >
              <MessageCircle className="size-5 text-white" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 pr-6 text-left">
              <DialogTitle className="font-heading text-lg font-bold leading-tight text-white sm:text-xl">
                👋 Planning {article} {destination.shortName} Trip?
              </DialogTitle>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/90">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
                </span>
                Expert is online
              </p>
            </div>
          </div>

          <div className="space-y-5 px-5 py-6 text-left">
            <DialogDescription className="text-[15px] leading-relaxed text-gray-600">
              Our {destination.shortName} travel expert is online.
              <br />
              Get itinerary, pricing, permits and the best package within
              minutes.
            </DialogDescription>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onWhatsAppChat}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold text-white shadow-[0_6px_18px_rgba(37,211,102,0.35)] transition-transform hover:bg-[#1ebe5d] hover:brightness-105 active:translate-y-px"
              >
                <WhatsAppGlyph className="size-5" />
                Chat on WhatsApp
              </button>
              <button
                type="button"
                onClick={onWhatsAppLater}
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
