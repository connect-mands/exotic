import { after } from "next/server";
import { getDestinationBySlug, getPackageById } from "@/config/destinations";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import type { EnquiryFormValues } from "@/lib/validation";

export type EnquiryEmailStatus = "sent" | "failed" | "not_configured";

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function packageTitle(destination: string, packageId: string): string | null {
  try {
    const pkg = getPackageById(getDestinationBySlug(destination).packages, packageId);
    return pkg ? clip(pkg.title, 255) : null;
  } catch {
    return null;
  }
}

/**
 * Starts saving a verified enquiry without delaying the response. Call
 * `complete()` with the email outcome; the status update runs after the
 * response is sent. Database failures are logged and never affect the enquiry.
 */
export function recordEnquirySubmission(
  data: EnquiryFormValues,
  websiteDomain: string,
  submittedAt: Date
): { complete(emailStatus: EnquiryEmailStatus): void } {
  let created: Promise<{ id: string } | null> = Promise.resolve(null);

  try {
    if (isDatabaseConfigured()) {
      const email = data.email.trim();
      created = getDb()
        .enquiry.create({
          data: {
            createdAt: submittedAt,
            websiteDomain: clip(websiteDomain, 255),
            fullName: clip(data.fullName, 100),
            email: email ? clip(email, 254) : null,
            mobile: clip(data.mobile, 15),
            city: clip(data.city, 80),
            persons: Number.parseInt(data.persons.trim(), 10),
            destination: clip(data.destination, 64),
            packageId: clip(data.packageId, 128),
            packageName: packageTitle(data.destination, data.packageId),
            flightBooked: data.flightBooked === "yes",
          },
          select: { id: true },
        })
        .catch((error: unknown) => {
          console.error("[enquiry-store] Failed to save enquiry", error);
          return null;
        });
    }
  } catch (error) {
    console.error("[enquiry-store] Failed to start saving enquiry", error);
  }

  return {
    complete(emailStatus) {
      try {
        after(async () => {
          const row = await created;
          if (!row) return;
          try {
            await getDb().enquiry.update({ where: { id: row.id }, data: { emailStatus } });
          } catch (error) {
            console.error("[enquiry-store] Failed to update enquiry email status", error);
          }
        });
      } catch (error) {
        console.error("[enquiry-store] Failed to schedule enquiry status update", error);
      }
    },
  };
}
