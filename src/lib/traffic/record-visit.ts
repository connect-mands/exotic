import { getTrafficSettings } from "@/config/traffic-monitor";
import { getDb } from "@/lib/db";
import { encryptIp } from "@/lib/traffic/ip-crypto";
import { detectBrowser, detectDevice } from "@/lib/traffic/user-agent";
import type { TrackingPayload } from "@/lib/traffic/validation";

const DUPLICATE_WINDOW_MS = 5_000;
const RATE_WINDOW_MS = 60_000;

let warnedMissingKey = false;

export interface VisitInput {
  websiteDomain: string;
  pathname: string;
  referrer: { url: string; domain: string } | null;
  params: NonNullable<TrackingPayload["params"]>;
  userAgent: string | null;
  ip: string | null;
  ipHash: string | null;
  sessionId: string;
  isNewSession: boolean;
}

export type RecordVisitResult = "recorded" | "duplicate" | "rate_limited";

const ATTRIBUTION_SELECT = {
  gclid: true,
  gbraid: true,
  wbraid: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  utmTerm: true,
  utmContent: true,
} as const;

function hasAttribution(params: VisitInput["params"]): boolean {
  return Boolean(
    params.gclid ||
      params.gbraid ||
      params.wbraid ||
      params.utm_source ||
      params.utm_medium ||
      params.utm_campaign
  );
}

export async function recordVisit(input: VisitInput): Promise<RecordVisitResult> {
  const db = getDb();
  const settings = getTrafficSettings();
  const now = Date.now();
  const incomingAttributed = hasAttribution(input.params);
  const knownSession = !input.isNewSession;

  const [recentFromIp, firstInSession, lastAttributed, duplicate] =
    await Promise.all([
      input.ipHash
        ? db.websiteVisit.count({
            where: {
              ipHash: input.ipHash,
              createdAt: { gte: new Date(now - RATE_WINDOW_MS) },
            },
          })
        : Promise.resolve(0),
      knownSession
        ? db.websiteVisit.findFirst({
            where: { sessionId: input.sessionId },
            orderBy: { createdAt: "asc" },
            select: { pathname: true },
          })
        : Promise.resolve(null),
      knownSession && !incomingAttributed
        ? db.websiteVisit.findFirst({
            where: {
              sessionId: input.sessionId,
              OR: [
                { gclid: { not: null } },
                { gbraid: { not: null } },
                { wbraid: { not: null } },
                { utmSource: { not: null } },
                { utmCampaign: { not: null } },
              ],
            },
            orderBy: { createdAt: "desc" },
            select: ATTRIBUTION_SELECT,
          })
        : Promise.resolve(null),
      knownSession
        ? db.websiteVisit.findFirst({
            where: {
              sessionId: input.sessionId,
              pathname: input.pathname,
              createdAt: { gte: new Date(now - DUPLICATE_WINDOW_MS) },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

  if (recentFromIp >= settings.maxVisitsPerMinute) return "rate_limited";
  if (duplicate) return "duplicate";

  const attribution = incomingAttributed
    ? {
        gclid: input.params.gclid ?? null,
        gbraid: input.params.gbraid ?? null,
        wbraid: input.params.wbraid ?? null,
        utmSource: input.params.utm_source ?? null,
        utmMedium: input.params.utm_medium ?? null,
        utmCampaign: input.params.utm_campaign ?? null,
        utmTerm: input.params.utm_term ?? null,
        utmContent: input.params.utm_content ?? null,
      }
    : (lastAttributed ?? {});

  let encryptedIp: string | null = null;
  if (settings.storeRawIp && input.ip) {
    encryptedIp = encryptIp(input.ip);
    if (!encryptedIp && !warnedMissingKey) {
      warnedMissingKey = true;
      console.warn(
        "[traffic] TRAFFIC_STORE_RAW_IP is enabled but TRAFFIC_IP_ENCRYPTION_KEY is missing or invalid; raw IPs are not stored."
      );
    }
  }

  await db.websiteVisit.create({
    data: {
      websiteDomain: input.websiteDomain,
      ipAddress: encryptedIp,
      ipHash: input.ipHash,
      sessionId: input.sessionId,
      pageUrl: `https://${input.websiteDomain}${input.pathname}`.slice(0, 1024),
      pathname: input.pathname,
      landingPage: firstInSession?.pathname ?? input.pathname,
      referrer: input.referrer?.url ?? null,
      referrerDomain: input.referrer?.domain ?? null,
      userAgent: input.userAgent?.slice(0, 512) ?? null,
      deviceType: detectDevice(input.userAgent),
      browser: detectBrowser(input.userAgent),
      ...attribution,
    },
  });

  return "recorded";
}
