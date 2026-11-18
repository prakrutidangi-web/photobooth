# Go-live checklist: Supabase + Vercel

Menu names below match the dashboards as I know them. Supabase and Vercel rename things now and then, so if a label differs, look for the closest match.

## Part 1: Supabase (login)

1. Go to https://supabase.com and sign up. Click **New project**.
2. Pick a name (e.g. `photobooth`), choose a **strong database password** (save it in a password manager; this app never needs it), choose the region closest to your users, click **Create**. Wait about 2 minutes.
3. Get your keys: **Project Settings > API** (or the **Connect** button).
   - Copy **Project URL**
   - Copy the **anon / public** key
   - Do NOT copy or use the `service_role` key anywhere in this app.
4. Email login: **Authentication > Providers > Email**
   - Enable it.
   - Turn **Confirm email** ON.
   - Set **minimum password length** to 8 or more.
5. Security settings: **Authentication > Sign In / Providers** (or **Policies**), then:
   - Turn ON **leaked password protection** (may need the Pro plan; if it's locked, skip it).
   - Under **Authentication > Attack Protection**, turn ON **CAPTCHA** and pick Cloudflare Turnstile or hCaptcha. Create the free site key at that provider, paste the secret into Supabase. (Add the CAPTCHA widget to the login form before launch, or sign-ups will fail. Ask me and I'll add it.)
6. Redirect URLs: **Authentication > URL Configuration**
   - **Site URL**: `http://localhost:3000` for now (change to your real domain in Part 3).
   - **Redirect URLs**: add `http://localhost:3000/auth/callback`
7. (Optional) Google login: **Authentication > Providers > Google**
   1. Open https://console.cloud.google.com, create a project.
   2. **APIs & Services > OAuth consent screen**: fill in app name, your email, save.
   3. **Credentials > Create credentials > OAuth client ID > Web application**.
   4. Under **Authorized redirect URIs** paste the callback URL shown in the Supabase Google provider page (looks like `https://YOUR-PROJECT.supabase.co/auth/v1/callback`).
   5. Copy the Client ID and Client Secret into Supabase, enable the provider, save.

## Part 2: Run it on your Mac

```
cd /Users/prakrutidangi/photobooth/web
cp .env.local.example .env.local
```
Open `.env.local` and set:
```
NEXT_PUBLIC_SUPABASE_URL=<Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Then `npm run dev` and open http://localhost:3000.

Test all of these before deploying:
- [ ] Create account, receive the confirmation email, click the link, land in the booth.
- [ ] Sign out, sign in with email and password.
- [ ] Wrong password shows a generic error.
- [ ] Visiting `/studio` while signed out sends you to `/login`.
- [ ] Google login (if you enabled it).
- [ ] Take a strip, switch looks, download the PNG.

## Part 3: Vercel (hosting)

1. Put the code on GitHub. In `/Users/prakrutidangi/photobooth/web`:
   ```
   git init && git add . && git commit -m "Photobooth"
   ```
   Create an empty **private** repo on github.com, then follow the two commands GitHub shows (`git remote add origin ...` and `git push -u origin main`). `.env.local` is already git-ignored, so your keys won't be pushed. Check with `git status` that it isn't listed.
2. Go to https://vercel.com, sign in with GitHub, click **Add New > Project**, import the repo.
3. Set **Root Directory** to `web` if you pushed the parent folder (skip if the repo root is already `web`).
4. Under **Environment Variables** add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = your final address (e.g. `https://yourdomain.com`; use the `*.vercel.app` address until you have a domain)
   Leave the AdSense variables empty for now.
5. Click **Deploy**. HTTPS is automatic.
6. Back in Supabase, **Authentication > URL Configuration**:
   - **Site URL** = your live address
   - **Redirect URLs**: add `https://YOUR-LIVE-ADDRESS/auth/callback`
7. Repeat the Part 2 test list on the live site. Also check the camera prompt works.

## Part 4: Domain (recommended before ads)

1. Buy a domain (Namecheap, Cloudflare, Porkbun...).
2. Vercel: **Project > Settings > Domains > Add**, then follow the DNS records it shows at your registrar.
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel and the Supabase Site URL / Redirect URLs to the new domain, then redeploy.

## Part 5: Ads (AdSense)

1. Needs a real domain, live Privacy and Terms pages (fill in `[your contact email]` in `app/privacy` and `app/terms` first), and some genuine content. Apply at https://adsense.google.com.
2. Approval can take days to weeks. Thin sites are sometimes rejected, so consider adding a few helpful pages (a "how to pose in a photobooth" guide, etc.) to the public site.
3. Once approved, create a **display ad unit**, then in Vercel add:
   - `NEXT_PUBLIC_ADSENSE_CLIENT` = `ca-pub-XXXXXXXXXXXXXXXX`
   - `NEXT_PUBLIC_ADSENSE_SLOT` = the ad unit's slot number
   and redeploy. The consent banner and ad slot turn on automatically, only on public pages.

## Before you announce it

- [ ] Fill in contact email in Privacy and Terms, and have both reviewed for your country.
- [ ] CAPTCHA added and working on sign-up.
- [ ] Supabase **Email** sending: the built-in sender is rate-limited. For real traffic set up custom SMTP (**Authentication > Emails > SMTP**), e.g. Resend or Postmark.
- [ ] Check your security headers at https://securityheaders.com.
- [ ] Never commit `.env.local`; never use the `service_role` key in this project.
