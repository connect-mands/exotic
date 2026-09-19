import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getWhatsAppEnv } from "@/lib/whatsapp/env";

export const OTP_RESEND_SECONDS = 60;
export const OTP_TTL_MS = 5 * 60 * 1000;
export const VERIFIED_TTL_MS = 30 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_SENDS_PER_HOUR = 5;
export const OTP_MAX_SENDS_PER_DAY = 8;
export const OTP_MAX_IP_SENDS_PER_HOUR = 12;
export const OTP_MAX_IP_VERIFIES_PER_HOUR = 20;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const CHALLENGE_COOKIE = "ey_wa_otp";
const VERIFIED_COOKIE = "ey_wa_verified";
const RATE_LIMIT_COOKIE = "ey_wa_otp_rl";

export interface OtpChallenge {
  phone: string;
  otpHash: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
}

export interface VerifiedSession {
  phone: string;
  expiresAt: number;
}

function getSigningSecret(): string {
  const { accessToken, verifyToken } = getWhatsAppEnv();
  const secret = accessToken || verifyToken;
  if (secret) return secret;
  if (process.env.NODE_ENV === "development") {
    return "dev-whatsapp-otp-secret";
  }
  throw new Error("WhatsApp OTP signing secret is not configured");
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function seal(payload: unknown): string {
  const secret = getSigningSecret();
  const json = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${json}.${sign(json, secret)}`;
}

function unseal<T>(token: string | undefined): T | null {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const json = token.slice(0, separator);
  const mac = token.slice(separator + 1);
  const secret = getSigningSecret();
  const expected = sign(json, secret);
  const providedBuffer = Buffer.from(mac);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(json, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function hashOtp(phone: string, otp: string): string {
  return createHash("sha256")
    .update(`${phone}:${otp}:${getSigningSecret()}`)
    .digest("hex");
}

export function hashesMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function readChallenge(request: NextRequest): OtpChallenge | null {
  const challenge = unseal<OtpChallenge>(
    request.cookies.get(CHALLENGE_COOKIE)?.value
  );
  if (!challenge || challenge.expiresAt <= Date.now()) {
    return null;
  }
  return challenge;
}

export function readVerifiedPhone(request: NextRequest): string | null {
  const session = unseal<VerifiedSession>(
    request.cookies.get(VERIFIED_COOKIE)?.value
  );
  if (!session || session.expiresAt <= Date.now()) {
    return null;
  }
  return session.phone;
}

export function setChallengeCookie(
  response: NextResponse,
  challenge: OtpChallenge
): void {
  response.cookies.set(
    CHALLENGE_COOKIE,
    seal(challenge),
    cookieOptions(Math.ceil(OTP_TTL_MS / 1000))
  );
}

export function setVerifiedCookie(response: NextResponse, phone: string): void {
  response.cookies.delete(CHALLENGE_COOKIE);
  response.cookies.set(
    VERIFIED_COOKIE,
    seal({
      phone,
      expiresAt: Date.now() + VERIFIED_TTL_MS,
    } satisfies VerifiedSession),
    cookieOptions(Math.ceil(VERIFIED_TTL_MS / 1000))
  );
}

export function clearChallengeCookie(response: NextResponse): void {
  response.cookies.delete(CHALLENGE_COOKIE);
}

interface OtpRateLimitState {
  phones: Record<string, number[]>;
  ips: Record<string, number[]>;
  ipVerifies: Record<string, number[]>;
}

const memorySendsByPhone = new Map<string, number[]>();
const memorySendsByIp = new Map<string, number[]>();
const memoryVerifiesByIp = new Map<string, number[]>();

export type OtpRateLimitResult =
  | { ok: true; state: OtpRateLimitState }
  | { ok: false; error: string; retryAfterSeconds: number; state: OtpRateLimitState };

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function pruneTimestamps(timestamps: number[], windowMs: number, now: number): number[] {
  return timestamps.filter((stamp) => now - stamp < windowMs);
}

function mergeTimestamps(
  first: number[] | undefined,
  second: number[] | undefined,
  windowMs: number,
  now: number
): number[] {
  return pruneTimestamps(
    [...new Set([...(first ?? []), ...(second ?? [])])],
    windowMs,
    now
  );
}

function retryAfterSeconds(
  timestamps: number[],
  max: number,
  windowMs: number,
  now: number
): number {
  if (timestamps.length < max) return 0;
  const sorted = [...timestamps].sort((a, b) => a - b);
  const oldestCounted = sorted[sorted.length - max];
  if (oldestCounted === undefined) return 0;
  return Math.max(1, Math.ceil((oldestCounted + windowMs - now) / 1000));
}

function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function emptyRateLimitState(): OtpRateLimitState {
  return { phones: {}, ips: {}, ipVerifies: {} };
}

function readRateLimitState(request: NextRequest): OtpRateLimitState {
  return unseal<OtpRateLimitState>(
    request.cookies.get(RATE_LIMIT_COOKIE)?.value
  ) ?? emptyRateLimitState();
}

function remember(map: Map<string, number[]>, key: string, stamps: number[]): void {
  map.set(key, stamps);
}

export function applyOtpRateLimitCookie(
  response: NextResponse,
  state: OtpRateLimitState
): void {
  response.cookies.set(
    RATE_LIMIT_COOKIE,
    seal(state),
    cookieOptions(Math.ceil(DAY_MS / 1000))
  );
}

export function consumeOtpSendQuota(
  request: NextRequest,
  phone: string
): OtpRateLimitResult {
  const now = Date.now();
  const ip = hashIp(getClientIp(request));
  const state = readRateLimitState(request);

  const phoneSends = mergeTimestamps(
    state.phones[phone],
    memorySendsByPhone.get(phone),
    DAY_MS,
    now
  );
  const ipSends = mergeTimestamps(
    state.ips[ip],
    memorySendsByIp.get(ip),
    HOUR_MS,
    now
  );

  const hourlyPhone = pruneTimestamps(phoneSends, HOUR_MS, now);
  const dailyPhone = pruneTimestamps(phoneSends, DAY_MS, now);
  const recentPhone = pruneTimestamps(
    phoneSends,
    OTP_RESEND_SECONDS * 1000,
    now
  );

  if (recentPhone.length > 0) {
    const lastSentAt = Math.max(...recentPhone);
    const retryAfterSecondsValue = Math.max(
      1,
      Math.ceil((lastSentAt + OTP_RESEND_SECONDS * 1000 - now) / 1000)
    );
    return {
      ok: false,
      retryAfterSeconds: retryAfterSecondsValue,
      state,
      error: `Please wait ${retryAfterSecondsValue}s before requesting another OTP`,
    };
  }

  if (hourlyPhone.length >= OTP_MAX_SENDS_PER_HOUR) {
    const retryAfterSecondsValue = retryAfterSeconds(
      hourlyPhone,
      OTP_MAX_SENDS_PER_HOUR,
      HOUR_MS,
      now
    );
    return {
      ok: false,
      retryAfterSeconds: retryAfterSecondsValue,
      state,
      error: `You can request at most ${OTP_MAX_SENDS_PER_HOUR} OTPs per hour. Try again in ${formatWait(retryAfterSecondsValue)}.`,
    };
  }

  if (dailyPhone.length >= OTP_MAX_SENDS_PER_DAY) {
    const retryAfterSecondsValue = retryAfterSeconds(
      dailyPhone,
      OTP_MAX_SENDS_PER_DAY,
      DAY_MS,
      now
    );
    return {
      ok: false,
      retryAfterSeconds: retryAfterSecondsValue,
      state,
      error: `You can request at most ${OTP_MAX_SENDS_PER_DAY} OTPs per day. Try again in ${formatWait(retryAfterSecondsValue)}.`,
    };
  }

  if (ipSends.length >= OTP_MAX_IP_SENDS_PER_HOUR) {
    const retryAfterSecondsValue = retryAfterSeconds(
      ipSends,
      OTP_MAX_IP_SENDS_PER_HOUR,
      HOUR_MS,
      now
    );
    return {
      ok: false,
      retryAfterSeconds: retryAfterSecondsValue,
      state,
      error: `Too many OTP requests from this network. Try again in ${formatWait(retryAfterSecondsValue)}.`,
    };
  }

  const nextPhoneSends = [...dailyPhone, now];
  const nextIpSends = [...ipSends, now];
  remember(memorySendsByPhone, phone, nextPhoneSends);
  remember(memorySendsByIp, ip, nextIpSends);

  const nextState: OtpRateLimitState = {
    ...state,
    phones: { ...state.phones, [phone]: nextPhoneSends },
    ips: { ...state.ips, [ip]: nextIpSends },
  };

  return { ok: true, state: nextState };
}

export function consumeOtpVerifyQuota(request: NextRequest): OtpRateLimitResult {
  const now = Date.now();
  const ip = hashIp(getClientIp(request));
  const state = readRateLimitState(request);
  const ipVerifies = mergeTimestamps(
    state.ipVerifies[ip],
    memoryVerifiesByIp.get(ip),
    HOUR_MS,
    now
  );

  if (ipVerifies.length >= OTP_MAX_IP_VERIFIES_PER_HOUR) {
    const retryAfterSecondsValue = retryAfterSeconds(
      ipVerifies,
      OTP_MAX_IP_VERIFIES_PER_HOUR,
      HOUR_MS,
      now
    );
    return {
      ok: false,
      retryAfterSeconds: retryAfterSecondsValue,
      state,
      error: `Too many verification attempts. Try again in ${formatWait(retryAfterSecondsValue)}.`,
    };
  }

  const nextVerifies = [...ipVerifies, now];
  remember(memoryVerifiesByIp, ip, nextVerifies);

  return {
    ok: true,
    state: {
      ...state,
      ipVerifies: { ...state.ipVerifies, [ip]: nextVerifies },
    },
  };
}
