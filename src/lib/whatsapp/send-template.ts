import { getWhatsAppEnv } from "@/lib/whatsapp/env";

const GRAPH_API_VERSION = "v21.0";

interface GraphErrorBody {
  error?: {
    message?: string;
  };
}

function toWhatsAppRecipient(phone: string): string {
  return `91${phone}`;
}

async function sendTemplate(
  to: string,
  otp: string,
  includeUrlButton: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { accessToken, phoneNumberId, templateName, templateLanguage } =
    getWhatsAppEnv();

  const components: Array<Record<string, unknown>> = [
    {
      type: "body",
      parameters: [{ type: "text", text: otp }],
    },
  ];

  if (includeUrlButton) {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: otp }],
    });
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components,
        },
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (response.ok) {
    return { ok: true };
  }

  let message = "Failed to send WhatsApp OTP";
  try {
    const body = (await response.json()) as GraphErrorBody;
    if (body.error?.message) {
      message = body.error.message;
    }
  } catch {
    // Keep the generic message when Meta returns a non-JSON error.
  }

  return { ok: false, error: message };
}

export async function sendWhatsAppOtpTemplate(
  phone: string,
  otp: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const {
    accessToken,
    phoneNumberId,
    templateName,
    businessAccountId,
  } = getWhatsAppEnv();

  if (!businessAccountId) {
    console.warn("[whatsapp] WHATSAPP_BUSINESS_ACCOUNT_ID is not set");
  }

  if (!accessToken || !phoneNumberId || !templateName) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[whatsapp] OTP for ${phone} (dev, Cloud API not configured): ${otp}`
      );
      return { ok: true };
    }
    return {
      ok: false,
      error: "WhatsApp OTP is not configured. Please try again later.",
    };
  }

  const to = toWhatsAppRecipient(phone);
  const withButton = await sendTemplate(to, otp, true);
  if (withButton.ok) {
    return withButton;
  }

  const buttonIssue = /button|component/i.test(withButton.error);
  if (!buttonIssue) {
    console.error("[whatsapp] Cloud API send failed", withButton.error);
    return {
      ok: false,
      error: "Unable to send OTP on WhatsApp. Please try again.",
    };
  }

  const bodyOnly = await sendTemplate(to, otp, false);
  if (bodyOnly.ok) {
    return bodyOnly;
  }

  console.error("[whatsapp] Cloud API send failed", bodyOnly.error);
  return {
    ok: false,
    error: "Unable to send OTP on WhatsApp. Please try again.",
  };
}
