# Netlify deployment — Exotic Yatra

## Prerequisites

- Git repository connected to Netlify
- [Resend](https://resend.com) account with a verified sending domain
- DNS for `bookandaman.in` and `bookkeralapackage.in` pointed to Netlify

## Build settings

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Publish directory | *(leave empty — Netlify detects Next.js automatically)* |

Netlify’s OpenNext adapter provisions serverless functions for App Router API routes, including `POST /api/enquiry`. You do not need a custom `functions` folder.

If Netlify does not auto-detect Next.js, ensure **Framework preset** is **Next.js** and remove any manual publish directory override (`.next` is not used as a static publish root for SSR apps).

## Environment variables

Set these in **Site configuration → Environment variables** (Production and Deploy previews as needed):

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | API key from Resend dashboard |
| `ENQUIRY_EMAIL` | Yes | Recipient for leads (e.g. `query@exoticyatra.com`) |
| `RESEND_FROM` | Yes (production) | Verified sender, e.g. `Exotic Yatra <notifications@exoticyatra.com>` |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL per site if you use separate Netlify sites |
| `WHATSAPP_ACCESS_TOKEN` | Yes | Permanent Meta Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes | WhatsApp sender phone number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Yes | WhatsApp Business Account ID |
| `WHATSAPP_TEMPLATE_NAME` | Yes | Approved OTP template name |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Recommended | Template language code (default `en_US`) |
| `WHATSAPP_VERIFY_TOKEN` | Yes | Webhook verify token (`exoticyatra_otp_verify`) |
| `NEXT_PUBLIC_GOOGLE_ADS_SEND_TO` | Optional | Google Ads conversion send_to (default `AW-17728878047` on Kerala) |
| `DATABASE_URL` | Yes | Same Neon Postgres URL as bhutanpackages.in (pooled URL at runtime) |
| `TRAFFIC_IP_HASH_SECRET` | Yes | Same secret as bhutanpackages.in, at least 32 characters. Visit tracking stays off without it |
| `TRAFFIC_ADMIN_PASSWORD` | Yes | Same admin password as bhutanpackages.in (min 16 characters) |
| `TRAFFIC_ADMIN_SESSION_SECRET` | Yes | Same session secret as bhutanpackages.in (min 32 characters) |
| `TRAFFIC_STORE_RAW_IP` | For real IPs | Set `true` only together with the encryption key below |
| `TRAFFIC_IP_ENCRYPTION_KEY` | For real IPs | Same 32-byte base64 key as bhutanpackages.in. Required to show stored IP addresses |

Copy `TRAFFIC_IP_HASH_SECRET`, `TRAFFIC_ADMIN_PASSWORD`, `TRAFFIC_ADMIN_SESSION_SECRET`, and `TRAFFIC_IP_ENCRYPTION_KEY` from the bhutanpackages.in Netlify site. A different hash secret makes Kerala and Andaman IP hashes not match Bhutan. A different encryption key cannot read IPs already stored in the shared database.

Do **not** set `NEXT_PUBLIC_DESTINATION` in production when using domain-based routing on a single deploy. Do **not** set `NEXT_PUBLIC_SITE_URL` on the shared deploy, or both domains will advertise one canonical URL.

### Resend setup

1. Add and verify your domain in Resend.
2. Create an API key and add it as `RESEND_API_KEY`.
3. Set `RESEND_FROM` to an address on the verified domain.
4. Set `ENQUIRY_EMAIL` to the inbox that should receive enquiries.

## Multi-domain routing

One Netlify site can serve both domains:

1. **Domain management** → add `bookandaman.in`, `www.bookandaman.in`, `bookkeralapackage.in`, `www.bookkeralapackage.in`.
2. The app resolves the destination from the `Host` / `x-forwarded-host` header:

| Host | Destination |
|------|-------------|
| `bookandaman.in`, `www.bookandaman.in` | Andaman |
| `bookkeralapackage.in`, `www.bookkeralapackage.in` | Kerala |

Enquiry emails include **Source Domain** so you can see which site submitted the lead.

## Local development

```bash
cp .env.example .env.local
# Add RESEND_API_KEY for real sends, or omit it to log enquiries to the console
npm run dev:andaman
```

## Verify after deploy

1. Submit a test enquiry on each domain.
2. Confirm email arrives at `ENQUIRY_EMAIL`.
3. Check **Functions** logs in Netlify if sends fail (missing API key, unverified `RESEND_FROM`, etc.).

## Limits

- Enquiry handler validates JSON, stores the lead, and calls Resend — well under typical 10s serverless timeouts.
- Visit tracking writes to the shared Postgres database. Run `npm run db:migrate` once against the direct (non-pooler) Neon URL if the tables are not already present from bhutanpackages.in.
- Dashboard: `/admin/traffic-monitor` on either domain. It shows Kerala, Andaman, and Bhutan rows from the shared database.
