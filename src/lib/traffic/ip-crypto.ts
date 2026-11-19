import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getTrafficSettings } from "@/config/traffic-monitor";

const FORMAT_VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const AAD = Buffer.from("WebsiteVisit.ipAddress", "utf8");

function getKey(): Buffer | null {
  const raw = getTrafficSettings().ipEncryptionKey.trim();
  if (!raw) return null;
  try {
    const key = Buffer.from(raw.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    return key.length === 32 ? key : null;
  } catch {
    return null;
  }
}

export function isIpEncryptionConfigured(): boolean {
  return getKey() !== null;
}

/** True when raw IPs will actually be stored (flag enabled and key valid). */
export function isRawIpStorageActive(): boolean {
  return getTrafficSettings().storeRawIp && isIpEncryptionConfigured();
}

/** Encrypts a normalized IP as `v1.<iv>.<tag>.<ciphertext>` (base64url). Returns null without a valid key. */
export function encryptIp(ip: string): string | null {
  const key = getKey();
  if (!key) return null;
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(AAD);
  const ciphertext = Buffer.concat([cipher.update(ip, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    FORMAT_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

/** Server-side only. Returns null for missing, malformed or undecryptable values. */
export function decryptIp(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = getKey();
  if (!key) return null;
  const [version, iv, tag, ciphertext] = value.split(".");
  if (version !== FORMAT_VERSION || !iv || !tag || !ciphertext) return null;
  try {
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "base64url"));
    decipher.setAAD(AAD);
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
