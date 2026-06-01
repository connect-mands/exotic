"use client";

import { ChevronRight } from "lucide-react";
import { useEnquiryDialog } from "@/context/enquiry-dialog-context";

export function VerticalQuoteTab() {
  const { openDialog } = useEnquiryDialog();

  return (
    <button
      type="button"
      onClick={() => openDialog()}
      className="fixed right-0 top-1/2 z-50 hidden -translate-y-1/2 items-center gap-1 rounded-l-md bg-gradient-to-b from-[#3b82f6] to-[#2563eb] py-5 pl-2 pr-1.5 text-[10px] font-bold leading-tight tracking-[0.18em] text-white shadow-[-4px_0_14px_rgba(37,99,235,0.35)] transition-all hover:pr-2.5 md:flex md:flex-col"
      aria-label="Get free quote"
    >
      <span style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
        GET FREE QUOTE
      </span>
      <ChevronRight className="size-3.5 shrink-0 rotate-90" aria-hidden />
    </button>
  );
}
