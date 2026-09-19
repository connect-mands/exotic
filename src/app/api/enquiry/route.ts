import { type NextRequest, NextResponse } from "next/server";
import { sendEnquiryEmail } from "@/lib/email";
import { getHostFromRequest, getSourceDomain } from "@/lib/request-host";
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

    await sendEnquiryEmail(parsed.data, {
      submittedAt,
      sourceDomain,
    });

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
