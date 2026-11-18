# Photobooth (Next.js + Supabase)

Vintage four-photo strips. Login via Supabase Auth, animations via Framer Motion. Photos are processed in the browser and never uploaded.

## Setup
1. Create a free project at https://supabase.com.
2. Authentication > Providers: enable Email (turn on "Confirm email") and optionally Google. Authentication > URL Configuration: set Site URL and add `http://localhost:3000/auth/callback` plus your production `/auth/callback` to Redirect URLs.
3. `cp .env.local.example .env.local` and fill in the URL + anon key (Project Settings > API). Never use the service_role key in this app.
4. `npm install && npm run dev` then open http://localhost:3000

## Deploy
Push to GitHub, import into Vercel, add the same env vars. HTTPS is automatic (required for the camera).

## Security notes
- Per-request nonce CSP, HSTS, no-sniff, frame denial, Permissions-Policy (camera only for this origin): see `proxy.ts` and `next.config.mjs`.
- `/studio` is protected twice: in `proxy.ts` and again server-side in the page (using `getUser()`, which verifies the token).
- Redirects after login are restricted to same-site paths (`lib/safe-redirect.ts`).
- Ad scripts load only on public pages, only after consent, never on /studio or /login.
- In Supabase also turn on: leaked-password protection, minimum password length 8+, CAPTCHA (Turnstile/hCaptcha) for sign-ups, and rate limits.

## Ads
Set `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` after AdSense approves your domain. Leave blank to disable.
