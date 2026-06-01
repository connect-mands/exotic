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

- Opens automatically ~1.2s after page load
- Re-opens from “Plan Your Trip”, package “Get Quote”, and mobile sticky CTAs
- POST `/api/enquiry` → Resend email to `ENQUIRY_EMAIL` (default: `query@exoticyatra.com`)

Configure Resend in `.env.local` (see `.env.example`). In development without `RESEND_API_KEY`, submissions are logged to the console.

## Deployment

### Netlify

See [docs/NETLIFY.md](docs/NETLIFY.md) for full steps.

**Environment variables:**

- `RESEND_API_KEY` — Resend API key
- `ENQUIRY_EMAIL` — lead recipient inbox
- `RESEND_FROM` — verified sender (required in production)
- `NEXT_PUBLIC_SITE_URL` — optional canonical URL for SEO

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
