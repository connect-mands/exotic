import { randomInt } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import {
  isValidIndianMobile,
  normalizeIndianMobile,
} from "@/lib/validation";
import {
  OTP_RESEND_SECONDS,
  OTP_TTL_MS,
  applyOtpRateLimitCookie,
  consumeOtpSendQuota,
  hashOtp,
  readChallenge,
  setChallengeCookie,
} from "@/lib/whatsapp/otp-session";
import { sendWhatsAppOtpTemplate } from "@/lib/whatsapp/send-template";

export const runtime = "nodejs";

const LOG_PREFIX = "[api/whatsapp/send-otp]";

function readPhone(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const raw = record.phone ?? record.mobile;
  if (typeof raw !== "string") return null;
  const phone = normalizeIndianMobile(raw);
  return isValidIndianMobile(phone) ? phone : null;
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

    const phone = readPhone(body);
    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a valid 10-digit Indian mobile number",
        },
        { status: 400 }
      );
    }

    const existing = readChallenge(request);
    if (
      existing &&
      existing.phone === phone &&
      Date.now() - existing.sentAt < OTP_RESEND_SECONDS * 1000
    ) {
      const waitSeconds = Math.ceil(
        (OTP_RESEND_SECONDS * 1000 - (Date.now() - existing.sentAt)) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${waitSeconds}s before requesting another OTP`,
          retryAfterSeconds: waitSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(waitSeconds) },
        }
      );
    }

    const quota = consumeOtpSendQuota(request, phone);
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

    const otp = String(randomInt(100000, 1000000));
    const sent = await sendWhatsAppOtpTemplate(phone, otp);
    if (!sent.ok) {
      const response = NextResponse.json(
        { success: false, error: sent.error },
        { status: 502 }
      );
      applyOtpRateLimitCookie(response, quota.state);
      return response;
    }

    const now = Date.now();
    const response = NextResponse.json({
      success: true,
      message: "OTP sent to your WhatsApp number",
    });

    setChallengeCookie(response, {
      phone,
      otpHash: hashOtp(phone, otp),
      expiresAt: now + OTP_TTL_MS,
      sentAt: now,
      attempts: 0,
    });
    applyOtpRateLimitCookie(response, quota.state);

    return response;
  } catch (error) {
    console.error(LOG_PREFIX, error);
    return NextResponse.json(
      { success: false, error: "Unable to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
