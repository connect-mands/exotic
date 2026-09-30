export const GOOGLE_ADS_ID = "AW-17728878047";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

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

  const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO ?? GOOGLE_ADS_ID;
  window.gtag("event", "conversion", { send_to: sendTo });
}
