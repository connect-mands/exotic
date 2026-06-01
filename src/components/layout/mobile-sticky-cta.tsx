"use client";

import { useEnquiryDialog } from "@/context/enquiry-dialog-context";

export function MobileStickyCTA() {
  const { openDialog } = useEnquiryDialog();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-2 shadow-lg md:hidden">
      <button
        type="button"
        onClick={() => openDialog()}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] py-3.5 text-center text-sm font-bold uppercase tracking-wider text-white shadow-lg"
      >
        Get Free Quote
      </button>
    </div>
  );
}
