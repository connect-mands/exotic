export const GOOGLE_ADS_ID = "AW-17728878047";

export const LEAD_FORM_CONVERSION_SEND_TO =
  "AW-17728878047/x78kCJL2m-gcEN_r5IVC";

const PAGE_VIEW_CONVERSION_SEND_TO =
  "AW-17728878047/s0JSCPaj3L8bEN_r5IVC";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackLeadFormConversion(): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: LEAD_FORM_CONVERSION_SEND_TO,
  });
}

/**
 * WhatsApp clicks stay off the lead-form and page-view conversion actions.
 * A Google Ads conversion is sent only when a separate label is configured.
 */
export function trackWhatsAppConversion(): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "whatsapp_click",
    event_category: "lead",
    event_label: "whatsapp_popup",
  });

  if (typeof window.gtag !== "function") return;

  window.gtag("event", "generate_lead", {
    method: "whatsapp",
  });

  const sendTo = whatsAppConversionSendTo();
  if (!sendTo) return;

  window.gtag("event", "conversion", { send_to: sendTo });
}

function whatsAppConversionSendTo(): string | undefined {
  const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO;
  if (!sendTo?.includes("/")) return undefined;
  if (
    sendTo === LEAD_FORM_CONVERSION_SEND_TO ||
    sendTo === PAGE_VIEW_CONVERSION_SEND_TO
  ) {
    return undefined;
  }
  return sendTo;
}
