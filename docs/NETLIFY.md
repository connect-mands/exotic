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

Do **not** set `NEXT_PUBLIC_DESTINATION` in production when using domain-based routing on a single deploy.

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

- Enquiry handler only validates JSON and calls Resend — well under typical 10s serverless timeouts.
- No database, uploads, or WebSockets — suitable for Netlify’s free tier aside from traffic/bandwidth limits on your plan.
