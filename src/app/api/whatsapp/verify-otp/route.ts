import { type NextRequest, NextResponse } from "next/server";
import {
  isValidIndianMobile,
  normalizeIndianMobile,
} from "@/lib/validation";
import {
  OTP_MAX_ATTEMPTS,
  applyOtpRateLimitCookie,
  clearChallengeCookie,
  consumeOtpVerifyQuota,
  hashOtp,
  hashesMatch,
  readChallenge,
  setChallengeCookie,
  setVerifiedCookie,
} from "@/lib/whatsapp/otp-session";

export const runtime = "nodejs";

const LOG_PREFIX = "[api/whatsapp/verify-otp]";

function readPayload(body: unknown): { phone: string; otp: string } | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const rawPhone = record.phone ?? record.mobile;
  const rawOtp = record.otp ?? record.code;
  if (typeof rawPhone !== "string" || typeof rawOtp !== "string") {
    return null;
  }
  const phone = normalizeIndianMobile(rawPhone);
  const otp = rawOtp.replace(/\D/g, "");
  if (!isValidIndianMobile(phone) || !/^\d{6}$/.test(otp)) {
    return null;
  }
  return { phone, otp };
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const payload = readPayload(body);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Enter a valid mobile number and 6-digit OTP" },
        { status: 400 }
      );
    }

    const quota = consumeOtpVerifyQuota(request);
    if (!quota.ok) {
      const response = NextResponse.json(
        {
          success: false,
          error: quota.error,
          retryAfterSeconds: quota.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(quota.retryAfterSeconds) },
        }
      );
      applyOtpRateLimitCookie(response, quota.state);
      return response;
    }

    const challenge = readChallenge(request);
    if (!challenge || challenge.phone !== payload.phone) {
      const response = NextResponse.json(
        {
          success: false,
          error: "OTP expired or not found. Please request a new code.",
        },
        { status: 400 }
      );
      applyOtpRateLimitCookie(response, quota.state);
      return response;
    }

    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Too many incorrect attempts. Please request a new OTP.",
        },
        { status: 429 }
      );
      clearChallengeCookie(response);
      applyOtpRateLimitCookie(response, quota.state);
      return response;
    }

    const expected = hashOtp(payload.phone, payload.otp);
    if (!hashesMatch(expected, challenge.otpHash)) {
      const remaining = OTP_MAX_ATTEMPTS - challenge.attempts - 1;
      const response = NextResponse.json(
        {
          success: false,
          error:
            remaining > 0
              ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
              : "Too many incorrect attempts. Please request a new OTP.",
        },
        { status: 400 }
      );
      if (remaining > 0) {
        setChallengeCookie(response, {
          ...challenge,
          attempts: challenge.attempts + 1,
        });
      } else {
        clearChallengeCookie(response);
      }
      applyOtpRateLimitCookie(response, quota.state);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      message: "WhatsApp number verified",
    });
    setVerifiedCookie(response, payload.phone);
    applyOtpRateLimitCookie(response, quota.state);
    return response;
  } catch (error) {
    console.error(LOG_PREFIX, error);
    return NextResponse.json(
      { success: false, error: "Unable to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
