import { type NextRequest, NextResponse } from "next/server";
import { sendEnquiryEmail } from "@/lib/email";
import { recordEnquirySubmission } from "@/lib/enquiries/record-enquiry";
import { getHostFromRequest, getSourceDomain } from "@/lib/request-host";
import { recordEnquiryLead } from "@/lib/traffic/record-lead";
import { enquirySchema } from "@/lib/validation";
import { readVerifiedPhone } from "@/lib/whatsapp/otp-session";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid form data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const verifiedPhone = readVerifiedPhone(request);
    if (!verifiedPhone || verifiedPhone !== parsed.data.mobile) {
      return NextResponse.json(
        { error: "Please verify your WhatsApp number before submitting." },
        { status: 403 }
      );
    }

    const submittedAt = new Date();
    const sourceDomain = getSourceDomain(getHostFromRequest(request));
    const storedEnquiry = recordEnquirySubmission(parsed.data, sourceDomain, submittedAt);

    try {
      await sendEnquiryEmail(parsed.data, {
        submittedAt,
        sourceDomain,
      });
    } catch (error) {
      storedEnquiry.complete("failed");
      throw error;
    }

    storedEnquiry.complete(process.env.RESEND_API_KEY ? "sent" : "not_configured");
    recordEnquiryLead(request, sourceDomain);

    return NextResponse.json({
      message: "Enquiry sent successfully",
      submittedAt: submittedAt.toISOString(),
    });
  } catch (error) {
    console.error("[api/enquiry]", error);
    return NextResponse.json(
      {
        error:
          "Unable to send enquiry. Please try again or call us directly.",
      },
      { status: 500 }
    );
  }
}
