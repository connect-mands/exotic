import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getWhatsAppEnv } from "@/lib/whatsapp/env";

export const runtime = "nodejs";

const LOG_PREFIX = "[api/webhook]";

function tokensMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
    const { verifyToken } = getWhatsAppEnv();

    if (!verifyToken) {
      console.error(`${LOG_PREFIX} WHATSAPP_VERIFY_TOKEN is not configured`);
      return new NextResponse("Webhook verification is not configured", {
        status: 500,
      });
    }

    if (
      mode === "subscribe" &&
      token !== null &&
      challenge !== null &&
      tokensMatch(token, verifyToken)
    ) {
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch (error) {
    console.error(`${LOG_PREFIX} GET verification failed`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, phoneNumberId } = getWhatsAppEnv();

    if (!accessToken || !phoneNumberId) {
      console.warn(
        `${LOG_PREFIX} WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured`
      );
    }

    const rawBody = await request.text();
    let body: unknown = null;

    if (rawBody.length > 0) {
      try {
        body = JSON.parse(rawBody) as unknown;
      } catch {
        console.error(`${LOG_PREFIX} Invalid JSON payload`, rawBody);
        return NextResponse.json(
          { error: "Invalid JSON payload" },
          { status: 400 }
        );
      }
    }

    console.log(`${LOG_PREFIX} Incoming payload:`, JSON.stringify(body, null, 2));

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error(`${LOG_PREFIX} POST failed`, error);
    return NextResponse.json(
      { error: "Unable to process webhook" },
      { status: 500 }
    );
  }
}
