import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import {
  buildEnquiryEmailContent,
  type EnquiryEmailContext,
} from "@/lib/email/enquiry-template";
import type { EnquiryFormValues } from "@/lib/validation";

export interface SendEnquiryEmailOptions {
  submittedAt: Date;
  sourceDomain: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getEnquiryRecipient(): string {
  return process.env.ENQUIRY_EMAIL ?? siteConfig.enquiryRecipient;
}

function getFromAddress(): string {
  return (
    process.env.RESEND_FROM ??
    "Exotic Yatra <onboarding@resend.dev>"
  );
}

export async function sendEnquiryEmail(
  data: EnquiryFormValues,
  options: SendEnquiryEmailOptions
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      const context: EnquiryEmailContext = {
        data,
        submittedAt: options.submittedAt,
        sourceDomain: options.sourceDomain,
      };
      const { subject, text } = buildEnquiryEmailContent(context);
      console.info("[enquiry] RESEND_API_KEY not set — logging submission:");
      console.info(subject);
      console.info(text);
      return;
    }
    throw new Error("Email service is not configured");
  }

  const context: EnquiryEmailContext = {
    data,
    submittedAt: options.submittedAt,
    sourceDomain: options.sourceDomain,
  };
  const { subject, html, text } = buildEnquiryEmailContent(context);
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: [getEnquiryRecipient()],
    replyTo: data.email,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message);
  }
}
