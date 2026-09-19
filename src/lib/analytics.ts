declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
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

  const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO;
  if (sendTo) {
    window.gtag("event", "conversion", { send_to: sendTo });
    return;
  }

  window.gtag("event", "conversion", {
    event_category: "whatsapp",
    event_label: "popup_chat",
  });
}
