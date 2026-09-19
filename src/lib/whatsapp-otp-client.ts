export interface WhatsAppOtpApiResult {
  ok: boolean;
  message?: string;
  error?: string;
  retryAfterSeconds?: number;
}

interface WhatsAppOtpApiBody {
  success?: boolean;
  message?: string;
  error?: string;
  retryAfterSeconds?: number;
}

function readRetryAfter(
  response: Response,
  data: WhatsAppOtpApiBody | null
): number | undefined {
  if (
    typeof data?.retryAfterSeconds === "number" &&
    Number.isFinite(data.retryAfterSeconds) &&
    data.retryAfterSeconds > 0
  ) {
    return Math.ceil(data.retryAfterSeconds);
  }

  const header = Number(response.headers.get("Retry-After"));
  if (Number.isFinite(header) && header > 0) {
    return Math.ceil(header);
  }

  return undefined;
}

async function postWhatsAppOtp(
  url: string,
  body: Record<string, string>
): Promise<WhatsAppOtpApiResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data: WhatsAppOtpApiBody | null = null;
    try {
      data = (await response.json()) as WhatsAppOtpApiBody;
    } catch {
      data = null;
    }

    if (!response.ok || data?.success === false) {
      const error =
        data?.error ??
        data?.message ??
        (response.status === 404
          ? "OTP service is unavailable. Please try again later."
          : "Unable to verify WhatsApp number. Please try again.");
      return {
        ok: false,
        error,
        retryAfterSeconds: readRetryAfter(response, data),
      };
    }

    return {
      ok: true,
      message: data?.message,
    };
  } catch {
    return {
      ok: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}

export function sendWhatsAppOtp(phone: string): Promise<WhatsAppOtpApiResult> {
  return postWhatsAppOtp("/api/whatsapp/send-otp", { phone, mobile: phone });
}

export function verifyWhatsAppOtp(
  phone: string,
  otp: string
): Promise<WhatsAppOtpApiResult> {
  return postWhatsAppOtp("/api/whatsapp/verify-otp", {
    phone,
    mobile: phone,
    otp,
  });
}
