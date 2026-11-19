import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { getTrafficSettings } from "@/config/traffic-monitor";

const MIN_SECRET_LENGTH = 32;

export function isHashSecretConfigured(): boolean {
  return getTrafficSettings().hashSecret.length >= MIN_SECRET_LENGTH;
}

export function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim();
  if (!value || value.length > 64) return null;

  if (value.startsWith("[") && value.includes("]")) {
    value = value.slice(1, value.indexOf("]"));
  }
  const zoneIndex = value.indexOf("%");
  if (zoneIndex > 0) value = value.slice(0, zoneIndex);

  const lower = value.toLowerCase();
  if (lower.startsWith("::ffff:") && isIP(lower.slice(7)) === 4) {
    return lower.slice(7);
  }

  const version = isIP(lower);
  if (version === 0) return null;
  return lower;
}

/**
 * Reads the client IP only from the configured trusted header, which the
 * hosting edge (Netlify) overwrites on every request. X-Forwarded-For and
 * other client-controllable headers are deliberately ignored.
 */
export function getTrustedClientIp(request: Request): string | null {
  const { trustedIpHeader } = getTrafficSettings();
  if (!trustedIpHeader || trustedIpHeader === "x-forwarded-for") return null;
  return normalizeIp(request.headers.get(trustedIpHeader));
}

export function hashIp(normalizedIp: string): string | null {
  const { hashSecret } = getTrafficSettings();
  if (hashSecret.length < MIN_SECRET_LENGTH) return null;
  return createHmac("sha256", hashSecret).update(normalizedIp).digest("hex");
}
