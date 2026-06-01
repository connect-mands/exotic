import { getDestinationBySlug, getPackageById } from "@/config/destinations";
import type { EnquiryFormValues } from "@/lib/validation";

export interface EnquiryEmailContext {
  data: EnquiryFormValues;
  submittedAt: Date;
  sourceDomain: string;
}

export interface EnquiryEmailContent {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  });
}

function buildMessageBlock(data: EnquiryFormValues, packageLabel: string): string {
  const flightLabel = data.flightBooked === "yes" ? "Yes" : "No";
  return [
    `City: ${data.city}`,
    `Package: ${packageLabel}`,
    `Flight/Train booked: ${flightLabel}`,
  ].join("\n");
}

export function buildEnquiryEmailContent(
  context: EnquiryEmailContext
): EnquiryEmailContent {
  const { data, submittedAt, sourceDomain } = context;
  const destination = getDestinationBySlug(data.destination);
  const pkg = getPackageById(destination.packages, data.packageId);
  const packageLabel = pkg
    ? `${pkg.title} (${pkg.duration})`
    : data.packageId;
  const travelDate = pkg?.duration ?? "Not specified";
  const timestamp = formatTimestamp(submittedAt);
  const message = buildMessageBlock(data, packageLabel);
  const subject = `New Travel Enquiry - ${destination.name}`;

  const rows: { label: string; value: string }[] = [
    { label: "Customer Name", value: data.fullName },
    { label: "Phone Number", value: data.mobile },
    { label: "Email Address", value: data.email },
    { label: "Destination", value: destination.name },
    { label: "Travel Date", value: travelDate },
    { label: "Number of Adults", value: data.persons },
    { label: "Number of Children", value: "—" },
    { label: "Message", value: message },
    { label: "Submission Timestamp", value: timestamp },
    { label: "Source Domain", value: sourceDomain },
  ];

  const tableRows = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background:#f9fafb;font-weight:600;color:#374151;width:38%;vertical-align:top;">
          ${escapeHtml(row.label)}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#111827;white-space:pre-line;">
          ${escapeHtml(row.value)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0f766e;padding:24px 28px;">
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">
                New Travel Enquiry
              </h1>
              <p style="margin:8px 0 0;font-size:14px;color:#ccfbf1;">
                ${escapeHtml(destination.name)} · ${escapeHtml(sourceDomain)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0 4px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                ${tableRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;font-size:12px;color:#6b7280;line-height:1.5;">
              This enquiry was submitted via the Exotic Yatra website. Reply directly to the customer using their email address above.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = [
    subject,
    "=".repeat(subject.length),
    ...rows.map((row) => `${row.label}: ${row.value}`),
  ].join("\n");

  return { subject, html, text };
}
