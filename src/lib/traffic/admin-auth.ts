import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  TRAFFIC_ADMIN_SESSION_TTL_SECONDS,
  TRAFFIC_DASHBOARD_PATH,
} from "@/config/traffic-monitor";
import { getDb, isDatabaseConfigured } from "@/lib/db";

export const MIN_ADMIN_PASSWORD_LENGTH = 16;
const MIN_SECRET_LENGTH = 32;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const LAST_SEEN_UPDATE_INTERVAL_MS = 5 * 60 * 1000;

/**
 * `__Host-` cookies must be Secure, host-only and Path=/, which prevents
 * subdomains or plain-HTTP responses from setting or overwriting them.
 */
export const ADMIN_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-ey_traffic_admin" : "ey_traffic_admin";

function getAdminPassword(): string {
  return process.env.TRAFFIC_ADMIN_PASSWORD ?? "";
}

function getSessionSecret(): string {
  return process.env.TRAFFIC_ADMIN_SESSION_SECRET ?? "";
}

export function isAdminAuthConfigured(): boolean {
  return (
    isDatabaseConfigured() &&
    getAdminPassword().length >= MIN_ADMIN_PASSWORD_LENGTH &&
    getSessionSecret().length >= MIN_SECRET_LENGTH
  );
}

function keyedHash(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function passwordFingerprint(): string {
  return keyedHash(`password:${getAdminPassword()}`);
}

function tokenHash(token: string): string {
  return keyedHash(`session:${token}`);
}

export function verifyAdminPassword(candidate: string): boolean {
  if (!isAdminAuthConfigured()) return false;
  return safeEqual(keyedHash(`password:${candidate}`), passwordFingerprint());
}

/** Creates a server-side session and returns the opaque cookie token. */
export async function createAdminSession(): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await getDb().adminSession.create({
    data: {
      tokenHash: tokenHash(token),
      passwordFingerprint: passwordFingerprint(),
      lastSeenAt: new Date(now),
      expiresAt: new Date(now + TRAFFIC_ADMIN_SESSION_TTL_SECONDS * 1000),
    },
  });
  return token;
}

/**
 * Valid only if the session exists server-side, is not revoked, expired or
 * idle, and was created with the current admin password. Fails closed on
 * database errors.
 */
export async function validateAdminSession(token: string | undefined): Promise<boolean> {
  if (!token || !TOKEN_PATTERN.test(token) || !isAdminAuthConfigured()) return false;
  try {
    const db = getDb();
    const session = await db.adminSession.findUnique({
      where: { tokenHash: tokenHash(token) },
    });
    const now = Date.now();
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= now ||
      session.lastSeenAt.getTime() <= now - IDLE_TIMEOUT_MS ||
      !safeEqual(session.passwordFingerprint, passwordFingerprint())
    ) {
      return false;
    }
    if (session.lastSeenAt.getTime() <= now - LAST_SEEN_UPDATE_INTERVAL_MS) {
      await db.adminSession.update({
        where: { id: session.id },
        data: { lastSeenAt: new Date(now) },
      });
    }
    return true;
  } catch (error) {
    console.error("[traffic] Admin session check failed", error);
    return false;
  }
}

/** Revokes the session server-side so a copied cookie stops working immediately. */
export async function revokeAdminSession(token: string | undefined): Promise<void> {
  if (!token || !TOKEN_PATTERN.test(token) || !isDatabaseConfigured()) return;
  if (getSessionSecret().length < MIN_SECRET_LENGTH) return;
  await getDb().adminSession.updateMany({
    where: { tokenHash: tokenHash(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function adminCookieOptions(maxAgeSeconds = TRAFFIC_ADMIN_SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Server-side guard for admin pages; redirects to the login page when unauthenticated. */
export async function requireAdminPage(): Promise<void> {
  const store = await cookies();
  if (!(await validateAdminSession(store.get(ADMIN_COOKIE_NAME)?.value))) {
    redirect(`${TRAFFIC_DASHBOARD_PATH}/login`);
  }
}
