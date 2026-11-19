import { z } from "zod";

export const TRACKED_QUERY_PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type TrackedQueryParam = (typeof TRACKED_QUERY_PARAMS)[number];

export const MAX_TRACKING_BODY_BYTES = 4096;

const CLICK_ID_PATTERN = /^[A-Za-z0-9_\-.~]{1,256}$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

const optionalText = (max: number) =>
  z
    .string()
    .max(max * 2)
    .optional()
    .transform((value) => {
      const cleaned = value?.replace(CONTROL_CHARS, "").trim().slice(0, max);
      return cleaned ? cleaned : undefined;
    });

const optionalClickId = z
  .string()
  .max(512)
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed && CLICK_ID_PATTERN.test(trimmed) ? trimmed : undefined;
  });

export const trackingPayloadSchema = z.object({
  path: z
    .string()
    .min(1)
    .max(2048)
    .refine((value) => value.startsWith("/") && !value.startsWith("//"), {
      message: "Invalid path",
    }),
  referrer: z.string().max(2048).optional(),
  nav: z.enum(["load", "push", "replace", "traverse"]).optional(),
  params: z
    .object({
      gclid: optionalClickId,
      gbraid: optionalClickId,
      wbraid: optionalClickId,
      utm_source: optionalText(255),
      utm_medium: optionalText(255),
      utm_campaign: optionalText(255),
      utm_term: optionalText(255),
      utm_content: optionalText(255),
    })
    .partial()
    .optional(),
});

export type TrackingPayload = z.infer<typeof trackingPayloadSchema>;

/** Returns a safe pathname (no query/hash), or null if invalid. */
export function sanitizePathname(path: string): string | null {
  try {
    const url = new URL(path, "https://placeholder.invalid");
    if (url.hostname !== "placeholder.invalid") return null;
    const pathname = url.pathname.replace(CONTROL_CHARS, "");
    if (!pathname.startsWith("/")) return null;
    return pathname.slice(0, 512);
  } catch {
    return null;
  }
}

/** Keeps origin + pathname of a referrer; drops query strings and fragments. */
export function sanitizeReferrer(
  referrer: string | undefined
): { url: string; domain: string } | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const domain = url.hostname.toLowerCase().slice(0, 255);
    return {
      url: `${url.protocol}//${url.host}${url.pathname}`.slice(0, 1024),
      domain,
    };
  } catch {
    return null;
  }
}

export function sanitizeHostname(host: string): string | null {
  const hostname = host.split(":")[0]?.trim().toLowerCase() ?? "";
  if (!hostname || hostname.length > 255) return null;
  if (!/^[a-z0-9.-]+$/.test(hostname)) return null;
  return hostname;
}
