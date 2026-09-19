import { siteConfig } from "@/config/site";

export const WHATSAPP_POPUP_ACTION_KEY = "whatsapp_popup_action";
export const WHATSAPP_POPUP_UNTIL_KEY = "whatsapp_popup_hide_until";
export const WHATSAPP_POPUP_CLICKED = "whatsapp_clicked";

const HIDE_MS = 7 * 24 * 60 * 60 * 1000;

export function getWhatsAppLeadHref(destinationLabel: string): string {
  const article = /^[aeiou]/i.test(destinationLabel) ? "an" : "a";
  return (
    `${siteConfig.whatsappHref}?text=` +
    encodeURIComponent(
      `Hi, I am planning ${article} ${destinationLabel} trip. Please share itinerary and pricing.`
    )
  );
}

export function shouldHideWhatsAppPopup(): boolean {
  try {
    const action = window.localStorage.getItem(WHATSAPP_POPUP_ACTION_KEY);
    const until = Number(window.localStorage.getItem(WHATSAPP_POPUP_UNTIL_KEY) ?? 0);
    return action === WHATSAPP_POPUP_CLICKED && until > Date.now();
  } catch {
    return false;
  }
}

export function persistWhatsAppPopupClick(): void {
  try {
    window.localStorage.setItem(WHATSAPP_POPUP_ACTION_KEY, WHATSAPP_POPUP_CLICKED);
    window.localStorage.setItem(
      WHATSAPP_POPUP_UNTIL_KEY,
      String(Date.now() + HIDE_MS)
    );
  } catch {
    // Private mode / blocked storage should not break the click.
  }
}
