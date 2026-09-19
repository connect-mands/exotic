import { siteConfig } from "@/config/site";

export const WHATSAPP_POPUP_ACTION_KEY = "whatsapp_popup_action";
export const WHATSAPP_POPUP_CLICKED = "whatsapp_clicked";

export function getWhatsAppLeadHref(destinationLabel: string): string {
  const article = /^[aeiou]/i.test(destinationLabel) ? "an" : "a";
  return (
    `${siteConfig.whatsappHref}?text=` +
    encodeURIComponent(
      `Hi, I am planning ${article} ${destinationLabel} trip. Please share itinerary and pricing.`
    )
  );
}

export function persistWhatsAppPopupClick(): void {
  try {
    window.localStorage.setItem(WHATSAPP_POPUP_ACTION_KEY, WHATSAPP_POPUP_CLICKED);
  } catch {
    // Private mode / blocked storage should not break the click.
  }
}
