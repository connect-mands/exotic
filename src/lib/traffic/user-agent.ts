export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

const BOT_PATTERN =
  /bot\b|crawler|spider|crawling|slurp|headlesschrome|phantomjs|lighthouse|pingdom|uptime|curl\/|wget\/|python-requests|axios\/|node-fetch|go-http-client/i;

export function detectDevice(userAgent: string | null): DeviceType {
  if (!userAgent) return "unknown";
  if (/ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/i.test(userAgent)) {
    return "tablet";
  }
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/i.test(userAgent)) {
    return "mobile";
  }
  if (/windows nt|macintosh|x11|linux x86_64|cros/i.test(userAgent)) {
    return "desktop";
  }
  return "unknown";
}

export function detectBrowser(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (BOT_PATTERN.test(userAgent)) return "Bot / automated";
  if (/edg(e|a|ios)?\//i.test(userAgent)) return "Edge";
  if (/opr\/|opera/i.test(userAgent)) return "Opera";
  if (/samsungbrowser\//i.test(userAgent)) return "Samsung Internet";
  if (/ucbrowser\//i.test(userAgent)) return "UC Browser";
  if (/fbav|fban|instagram/i.test(userAgent)) return "In-app (Meta)";
  if (/firefox\/|fxios\//i.test(userAgent)) return "Firefox";
  if (/chrome\/|crios\//i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent) && /version\//i.test(userAgent)) return "Safari";
  return null;
}
