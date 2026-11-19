import { type NextRequest, NextResponse } from "next/server";
import { TRAFFIC_DASHBOARD_PATH } from "@/config/traffic-monitor";
import { getDb } from "@/lib/db";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "@/lib/traffic/admin-auth";
import { getTrustedClientIp, hashIp } from "@/lib/traffic/ip";
import { createRateLimiter } from "@/lib/traffic/rate-limit";

const MAX_FAILURES = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const FAILURE_DELAY_MS = 750;

const consumeLoginAttempt = createRateLimiter(MAX_FAILURES * 2, FAILURE_WINDOW_MS);

function redirectTo(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const loginPath = `${TRAFFIC_DASHBOARD_PATH}/login`;

  if (!isSameOrigin(request)) {
    return new NextResponse(null, { status: 403 });
  }
  if (!isAdminAuthConfigured()) {
    return redirectTo(request, `${loginPath}?error=not-configured`);
  }

  const ip = getTrustedClientIp(request);
  const attemptKey = (ip && hashIp(ip)) || "unknown";
  if (!consumeLoginAttempt(attemptKey)) {
    return redirectTo(request, `${loginPath}?error=rate-limited`);
  }

  let password = "";
  try {
    const form = await request.formData();
    const value = form.get("password");
    password = typeof value === "string" ? value.slice(0, 256) : "";
  } catch {
    return redirectTo(request, `${loginPath}?error=invalid`);
  }

  const db = getDb();
  try {
    const recentFailures = await db.adminLoginAttempt.count({
      where: {
        attemptKey,
        success: false,
        createdAt: { gte: new Date(Date.now() - FAILURE_WINDOW_MS) },
      },
    });
    if (recentFailures >= MAX_FAILURES) {
      return redirectTo(request, `${loginPath}?error=rate-limited`);
    }

    const valid = verifyAdminPassword(password);
    await db.adminLoginAttempt.create({ data: { attemptKey, success: valid } });

    if (!valid) {
      console.warn(`[traffic] Failed admin login (key ${attemptKey.slice(0, 12)})`);
      await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
      return redirectTo(request, `${loginPath}?error=invalid`);
    }

    const token = await createAdminSession();
    const response = redirectTo(request, TRAFFIC_DASHBOARD_PATH);
    response.cookies.set(ADMIN_COOKIE_NAME, token, adminCookieOptions());
    return response;
  } catch (error) {
    console.error("[traffic] Admin login failed", error);
    return redirectTo(request, `${loginPath}?error=unavailable`);
  }
}
