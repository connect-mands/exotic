import { after, type NextRequest } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { getTrustedClientIp, hashIp } from "@/lib/traffic/ip";
import { readSessionId } from "@/lib/traffic/session";

/**
 * Records that an enquiry succeeded for the current visitor session. Runs
 * after the response is sent and never throws, so the enquiry flow is
 * unaffected. No form data is stored.
 */
export function recordEnquiryLead(request: NextRequest, websiteDomain: string): void {
  try {
    if (!isDatabaseConfigured()) return;

    const sessionId = readSessionId(request.cookies);
    const ip = getTrustedClientIp(request);
    const ipHash = ip ? hashIp(ip) : null;
    if (!sessionId && !ipHash) return;

    after(async () => {
      try {
        await getDb().websiteLead.create({
          data: {
            websiteDomain: websiteDomain.slice(0, 255),
            sessionId,
            ipHash,
          },
        });
      } catch (error) {
        console.error("[traffic] Failed to record enquiry lead", error);
      }
    });
  } catch (error) {
    console.error("[traffic] Failed to schedule enquiry lead", error);
  }
}
