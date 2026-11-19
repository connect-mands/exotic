import { after, type NextRequest, NextResponse } from "next/server";
import { TRAFFIC_SESSION_COOKIE, getTrafficSettings } from "@/config/traffic-monitor";
import { isDatabaseConfigured } from "@/lib/db";
import { getHostFromRequest } from "@/lib/request-host";
import { getTrustedClientIp, hashIp, isHashSecretConfigured } from "@/lib/traffic/ip";
import { createRateLimiter } from "@/lib/traffic/rate-limit";
import { recordVisit } from "@/lib/traffic/record-visit";
import { maybePurgeExpiredTrafficData } from "@/lib/traffic/retention";
import {
  createSessionId,
  readSessionId,
  sessionCookieOptions,
} from "@/lib/traffic/session";
import {
  MAX_TRACKING_BODY_BYTES,
  sanitizeHostname,
  sanitizePathname,
  sanitizeReferrer,
  trackingPayloadSchema,
} from "@/lib/traffic/validation";

const consumeIpQuota = createRateLimiter(
  getTrafficSettings().maxVisitsPerMinute,
  60_000
);

let warnedDisabled = false;

function noContent(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

function reject(status: number): NextResponse {
  return new NextResponse(null, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isSameOrigin(request: NextRequest, hostname: string): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).hostname.toLowerCase() === hostname;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const hostname = sanitizeHostname(getHostFromRequest(request));
  if (!hostname) return reject(400);
  if (!isSameOrigin(request, hostname)) return reject(403);

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return reject(415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_TRACKING_BODY_BYTES) return reject(413);

  let body: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text, "utf8") > MAX_TRACKING_BODY_BYTES) {
      return reject(413);
    }
    body = JSON.parse(text);
  } catch {
    return reject(400);
  }

  const parsed = trackingPayloadSchema.safeParse(body);
  if (!parsed.success) return reject(400);

  const pathname = sanitizePathname(parsed.data.path);
  if (!pathname) return reject(400);
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return noContent();
  }

  if (!isDatabaseConfigured() || !isHashSecretConfigured()) {
    if (!warnedDisabled) {
      warnedDisabled = true;
      console.warn(
        "[traffic] Visit tracking disabled: DATABASE_URL or TRAFFIC_IP_HASH_SECRET (min 32 chars) is not set."
      );
    }
    return noContent();
  }

  const ip = getTrustedClientIp(request);
  const ipHash = ip ? hashIp(ip) : null;

  if (!consumeIpQuota(ipHash ?? "unknown-ip")) return reject(429);

  const existingSessionId = readSessionId(request.cookies);
  const sessionId = existingSessionId ?? createSessionId();

  const response = noContent();
  response.cookies.set(TRAFFIC_SESSION_COOKIE, sessionId, sessionCookieOptions());

  try {
    const result = await recordVisit({
      websiteDomain: hostname,
      pathname,
      referrer: sanitizeReferrer(parsed.data.referrer),
      params: parsed.data.params ?? {},
      userAgent: request.headers.get("user-agent"),
      ip,
      ipHash,
      sessionId,
      isNewSession: !existingSessionId,
    });
    if (result === "rate_limited") return reject(429);
  } catch (error) {
    console.error("[traffic] Failed to record visit", error);
    return response;
  }

  after(maybePurgeExpiredTrafficData);
  return response;
}
