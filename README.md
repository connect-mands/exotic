# Exotic Yatra — Multi-Destination Travel Landing Pages

Production-ready Next.js 16 landing pages for lead generation, powered by a single configurable codebase.

**Domains**

| Destination | Domain | Config |
|-------------|--------|--------|
| Andaman | bookandaman.in | `src/config/destinations/andaman.ts` |
| Kerala | bookkeralapackage.in | `src/config/destinations/kerala.ts` |

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React Hook Form + Zod
- Framer Motion
- Resend (enquiry emails)
- Meta WhatsApp Cloud API (OTP verification)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev:andaman   # or dev:kerala
```

Open [http://localhost:3000](http://localhost:3000).

## Destination switching

1. **Production (recommended):** Deploy the same build to each domain. The active destination is resolved from the `Host` header (`bookandaman.in` → Andaman, `bookkeralapackage.in` → Kerala).

2. **Local / preview:** Set `NEXT_PUBLIC_DESTINATION=andaman` or `kerala` in `.env.local`.

3. **Separate builds:** `npm run build:andaman` / `npm run build:kerala`.

## Customising content

Edit only the destination config files:

- `src/config/destinations/andaman.ts`
- `src/config/destinations/kerala.ts`

Shared contact details: `src/config/site.ts`.

Each config controls hero copy, images, SEO, packages, highlights, benefits, and branding accents.

## Enquiry form

- After 2 seconds or 40% scroll, a WhatsApp lead popup appears first
- “Maybe Later” or close (X) opens the existing enquiry form after 500ms
- “Chat on WhatsApp” opens WhatsApp. A refresh starts the same WhatsApp popup flow again
- Enquiry form still opens immediately from “Plan Your Trip”, package “Get Quote”, and mobile sticky CTAs
- POST `/api/enquiry` → Resend email to `ENQUIRY_EMAIL` (default: `query@exoticyatra.com`)
- WhatsApp number verification is required before an enquiry can be sent
- The form calls `POST /api/whatsapp/send-otp` and `POST /api/whatsapp/verify-otp`
- Meta webhook verification stays at `GET/POST /api/webhook`

Configure Resend in `.env.local` (see `.env.example`). In development without `RESEND_API_KEY`, submissions are logged to the console.

### WhatsApp Cloud API

The app reads these from `process.env` only. Copy `.env.example` to `.env.local` and fill in the values from the Meta Developer app. Do not hardcode tokens. Use a permanent access token and phone number ID — the app does not generate tokens or run OAuth.

```
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_TEMPLATE_NAME=
WHATSAPP_TEMPLATE_LANGUAGE=en_US
WHATSAPP_VERIFY_TOKEN=exoticyatra_otp_verify
```

| Variable | Purpose |
|----------|---------|
| `WHATSAPP_ACCESS_TOKEN` | Permanent Meta Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp sender phone number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business Account ID |
| `WHATSAPP_TEMPLATE_NAME` | Approved OTP template name |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Template language code (default `en_US`) |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verify token (`exoticyatra_otp_verify`) |

Webhook URL: `https://your-domain.com/api/webhook`

## Deployment

### Netlify

See [docs/NETLIFY.md](docs/NETLIFY.md) for full steps.

**Environment variables:**

- `RESEND_API_KEY` — Resend API key
- `ENQUIRY_EMAIL` — lead recipient inbox
- `RESEND_FROM` — verified sender (required in production)
- `NEXT_PUBLIC_SITE_URL` — optional canonical URL for SEO
- `WHATSAPP_ACCESS_TOKEN` — permanent Meta Cloud API access token
- `WHATSAPP_PHONE_NUMBER_ID` — WhatsApp sender phone number ID
- `WHATSAPP_BUSINESS_ACCOUNT_ID` — WhatsApp Business Account ID
- `WHATSAPP_TEMPLATE_NAME` — approved OTP template name
- `WHATSAPP_TEMPLATE_LANGUAGE` — template language code (default `en_US`)
- `WHATSAPP_VERIFY_TOKEN` — webhook verify token (`exoticyatra_otp_verify`)

## Project structure

```
src/
  app/              # Routes, API, metadata
  components/       # UI, sections, forms, layout
  config/           # Site + destination configs
  context/          # Enquiry dialog state
  lib/
    email/          # Resend client, HTML template, send helper
    request-host.ts # Host → domain / destination resolution
    validation.ts
    get-destination.ts
  types/            # TypeScript types
docs/
  NETLIFY.md        # Netlify deployment guide
```

## License

Private — Exotic Yatra.
