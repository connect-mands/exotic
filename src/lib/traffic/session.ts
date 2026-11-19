import { randomBytes } from "node:crypto";
import {
  TRAFFIC_SESSION_COOKIE,
  TRAFFIC_SESSION_TTL_SECONDS,
} from "@/config/traffic-monitor";

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{22,64}$/;

export function readSessionId(
  cookies: { get(name: string): { value: string } | undefined }
): string | null {
  const value = cookies.get(TRAFFIC_SESSION_COOKIE)?.value;
  return value && SESSION_ID_PATTERN.test(value) ? value : null;
}

export function createSessionId(): string {
  return randomBytes(18).toString("base64url");
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TRAFFIC_SESSION_TTL_SECONDS,
  };
}
