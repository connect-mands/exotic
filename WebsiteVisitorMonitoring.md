# Task: Implement Google Ads Click Fraud & Website Visitor Monitoring

Implement a new, isolated Website Visitor Tracking and Google Ads Suspicious Click Monitoring module in this existing Next.js project.

## CRITICAL INSTRUCTION: NO OTHER CHANGES

This is an additive feature only.

- Do NOT modify existing website UI, design, landing pages, forms, APIs, authentication, SEO, Google Ads conversion tracking, Google Tag, GTM, analytics, or business logic.
- Do NOT modify existing Google Ads campaign settings or website tracking behavior.
- Do NOT rename, refactor, delete, or rewrite existing components, functions, files, or database models.
- Do NOT change existing Prisma models or fields. Add only new models and necessary relations/indexes if required.
- Do NOT install unnecessary dependencies.
- Do NOT change environment variables already in use.
- Do NOT modify existing conversion tracking or form submission flows.
- Do NOT automatically block IPs or visitors.
- Do NOT deploy or push changes.
- First inspect the project architecture, existing authentication, Prisma schema, database, routing, and admin dashboard.
- Follow existing project conventions.
- If any proposed implementation requires modifying existing functionality, stop and explain before proceeding.

## 1. Objective

Whenever someone visits the website, record useful visitor and session information in the existing PostgreSQL database using Prisma.

Build an admin-only dashboard that helps investigate:

- Repeated visits from the same public IP.
- Multiple Google Ads click IDs associated with the same IP.
- Unusual visit frequency.
- Visitors who repeatedly visit but do not submit enquiry forms.
- Campaign-wise traffic and lead activity.
- Potentially suspicious traffic patterns.

This is an investigation and monitoring tool, NOT a system that can prove competitor fraud.

## 2. Website Visit Tracking

Implement tracking through a lightweight, isolated Next.js mechanism compatible with the existing App Router or Pages Router architecture.

Capture the following information when a visitor lands on a page:

- Public IP address, obtained securely from the trusted hosting/proxy configuration.
- A keyed HMAC-SHA256 hash of the normalized IP for repeat-visitor analysis.
- Visit timestamp.
- Requested page URL and pathname.
- Referrer URL and domain.
- User agent.
- Device category: mobile, tablet, desktop, unknown.
- Browser family, if reliably detectable.
- Session ID.
- Landing page.
- UTM source, medium, campaign, term, content.
- Google Ads click IDs: gclid, gbraid, wbraid.
- Website hostname/domain.

Important security requirements:
- Never trust arbitrary client-supplied IP headers.
- Configure trusted proxy headers based on the actual hosting environment.
- Do not use X-Forwarded-For blindly.
- Do not store full query strings if they contain personal or sensitive information.
- Do not log passwords, OTPs, form contents, payment details, or authentication tokens.
- Add rate limiting and input validation to the tracking endpoint.
- Make tracking lightweight and asynchronous.
- Avoid blocking page rendering or delaying form submissions.
- Avoid duplicate records caused by React Strict Mode, page re-renders, or repeated initialization.
- Record page navigation appropriately for the existing routing system.

## 3. Prisma Database Models

Inspect the existing Prisma schema before adding models.

Create an additive model named WebsiteVisit with fields appropriate for:

- id
- websiteDomain
- ipAddress (only if raw IP storage is explicitly configured)
- ipHash
- sessionId
- pageUrl
- pathname
- referrer
- userAgent
- deviceType
- browser
- gclid
- gbraid
- wbraid
- utmSource
- utmMedium
- utmCampaign
- utmTerm
- utmContent
- createdAt

Add appropriate indexes:
- ipHash + createdAt
- gclid
- sessionId
- websiteDomain + createdAt
- createdAt

Use an environment-controlled secret for HMAC hashing. Never hardcode secrets.

Prefer privacy-preserving IP storage by default. If raw IP storage is necessary, restrict access and configure a short retention period.

Do not create a second database or Prisma client.

## 4. Repeat Visitor Analysis

Create backend aggregation logic to calculate:

- Total visits.
- Unique IP hashes.
- Repeat visits.
- Visits per IP hash.
- Distinct GCLIDs per IP hash.
- Number of sessions per IP hash.
- Time between visits.
- Pages visited.
- Campaign attribution.
- Whether an enquiry was recorded, where a reliable existing lead relationship is available.

Support date filters:
- Today.
- Yesterday.
- Last 7 days.
- Last 30 days.
- Custom date range.

Never assume one IP equals one person.

## 5. Suspicious Traffic Detection

Implement transparent, configurable heuristic rules.

Initial configurable examples:

A. Repeated visits:
- Same IP hash with 5 or more visits within 15 minutes.

B. Multiple Google Ads clicks:
- Same IP hash associated with 3 or more distinct GCLIDs within 30 minutes.

C. High-frequency activity:
- Same IP hash with 10 or more visits within one hour.

D. Repeated non-converting visits:
- Multiple Google Ads-attributed visits without a recorded lead.

These are investigation thresholds, not proof of fraud.

Each flagged record must include:
- Reason for flag.
- Number of visits.
- Time window.
- Number of distinct click IDs.
- Associated campaign information.
- First and last visit timestamps.

Use labels:
- Normal
- Suspicious — Review required
- Google-confirmed invalid (only if supported by imported Google Ads invalid-activity data)

Do NOT label visitors as competitors or fraudsters based on these signals.

Do NOT automatically block, exclude, or restrict anyone.

## 6. Lead Correlation

Inspect existing enquiry submission architecture before implementing this feature.

If reliable, associate a visitor/session with an existing successful enquiry using a session identifier or existing tracking mechanism.

Important:
- Do not modify the existing enquiry API contract.
- Do not change OTP verification.
- Do not change form validation.
- Do not change email delivery.
- Do not change Google Ads conversion event behavior.
- Record successful lead status only after the existing server-side enquiry process succeeds.
- If safe correlation cannot be implemented without changing existing form flows, show lead status as Unknown rather than changing those flows.

## 7. Admin Dashboard

Create a new, separate admin page using the existing admin authentication and authorization.

Possible route: /admin/traffic-monitor

Use the existing design system and UI components.

Dashboard cards:
- Total visits.
- Unique IP hashes.
- Repeat visitors.
- Google Ads-attributed visits.
- Distinct GCLIDs.
- Recorded enquiries.
- Suspicious traffic records.

Add campaign filters:
- Bhutan
- Andaman
- North East
- Other / Unknown

Do not hardcode campaign attribution if actual UTM or click ID data is available.

Add a visits table with:
- Timestamp
- Website
- IP hash (masked)
- Page
- Referrer
- Device
- Campaign
- GCLID (masked)
- Session ID (masked)
- Lead status
- Suspicious activity status

Add a suspicious traffic table with:
- IP hash
- Visit count
- Distinct click IDs
- First visit
- Last visit
- Detection reason
- Status

Add an IP detail view showing related visit history without exposing full IP addresses to ordinary admin users.

All tables must support pagination, sorting, and date filtering.

Use server-side pagination and aggregation. Do not load all visit records into the browser.

## 8. Google Ads Click ID Analysis

Capture GCLID, GBRAID, and WBRAID from landing-page query parameters.

Persist click IDs for the relevant session so that subsequent page navigation does not lose attribution.

Do not claim that a website visit equals a Google Ads billed click.

Do not assume every click ID is unique to a person.

Do not assume every Google Ads click produces a page load.

Provide campaign-level reporting based on available click IDs and UTM values.

Do not integrate Google Ads API unless explicitly requested in a future task.

## 9. Privacy, Security and Data Retention

- Use HMAC-SHA256 with a server-side secret.
- Do not expose raw IP addresses in API responses to ordinary dashboard users.
- Protect all dashboard routes and APIs using existing server-side authorization.
- Do not rely on client-side hiding for security.
- Validate all incoming tracking data.
- Add configurable retention and cleanup logic.
- Default to retaining visit data for 30 days unless existing legal or business requirements specify otherwise.
- Never store personal form data in the visitor tracking table.
- Update the privacy notice only if explicitly approved; do not silently edit existing website content.

## 10. Performance and Reliability

- Tracking must not delay the initial page load.
- Use asynchronous requests.
- Handle database errors without breaking website navigation.
- Add sensible rate limits.
- Prevent duplicate tracking.
- Ensure tracking endpoint does not become an open database-write API.
- Avoid excessive database writes.
- Use indexes and efficient queries.
- Ensure the dashboard works on desktop and mobile.

## 11. Testing

Test the following:

1. Normal direct website visit.
2. Google Ads visit with GCLID.
3. Visit with UTM parameters.
4. Repeat visits from the same IP.
5. Multiple GCLIDs from the same IP.
6. Multiple visitors sharing the same public IP.
7. Mobile and desktop visits.
8. Missing or malformed headers.
9. Missing tracking secret.
10. Tracking endpoint rate limiting.
11. Unauthorized dashboard access.
12. Database failures.
13. Existing enquiry form submission.
14. Existing OTP verification.
15. Existing Google Ads conversion tracking.

Verify that the old website functionality remains unchanged.

## 12. Final Report

After implementation, provide:

1. Files created.
2. Existing files modified and exact reasons.
3. Prisma model additions.
4. Database migration instructions.
5. Required new environment variables.
6. Dashboard route.
7. Security and privacy implementation.
8. Tests performed and results.
9. Confirmation that existing forms, OTP, emails, Google Ads tags, conversion tracking, and website pages were not changed.

If any requirement cannot be safely implemented without changing existing functionality, do not make that change. Explain the limitation first.