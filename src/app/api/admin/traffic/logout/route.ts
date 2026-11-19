import { type NextRequest, NextResponse } from "next/server";
import { TRAFFIC_DASHBOARD_PATH } from "@/config/traffic-monitor";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  revokeAdminSession,
} from "@/lib/traffic/admin-auth";

export async function POST(request: NextRequest) {
  try {
    await revokeAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
  } catch (error) {
    console.error("[traffic] Admin session revocation failed", error);
  }

  const response = NextResponse.redirect(
    new URL(`${TRAFFIC_DASHBOARD_PATH}/login`, request.url),
    303
  );
  response.cookies.set(ADMIN_COOKIE_NAME, "", adminCookieOptions(0));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
