# IRON LOG — Gym Progression Tracker

A dark, cyan, mobile-first gym tracker. Log weeks → days → exercises → sets,
duplicate a week to start the next one, and see your progression at a glance.
Backed by Supabase (Postgres + Auth), built with React + Vite + Tailwind.

The original single-file prototype lives in [`legacy/gym-tracker.html`](legacy/gym-tracker.html)
for reference — it used an anonymous "sync code" instead of real accounts.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Zustand (+ Immer) for state
- React Router
- Supabase: Postgres, Row Level Security, Auth (email/password + Google), Realtime

## Local setup

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + anon/publishable key
npm run dev
```

The two env vars come from your Supabase project's API settings
(Project Settings → API). They're safe to expose client-side — access is
enforced by Row Level Security, not by keeping the key secret.

## Database

One table, `workout_logs`, keyed by `user_id` (references `auth.users`), holding
the whole log as a `jsonb` blob (`{ weeks: { [mondayISO]: { days: { [dateISO]: { exercises: [...] } } } } }`).
RLS policies restrict every row to `auth.uid() = user_id`. A trigger on
`auth.users` auto-creates an empty row the moment someone signs up, so the app
never has to handle a "no row yet" state.

## Setting up "Sign in with Google"

You said you already have a Google Cloud OAuth Client ID/Secret — you just need
to wire it into Supabase:

1. In Google Cloud Console, on that OAuth client, add this to **Authorized
   redirect URIs**:

   ```text
   https://gplsrtovcvirqebsfomf.supabase.co/auth/v1/callback
   ```

2. In the Supabase dashboard for this project → **Authentication → Sign In / Providers → Google**,
   enable it and paste in the Client ID and Client Secret.
3. Under **Authentication → URL Configuration**, make sure your deployed
   domain (and `http://localhost:5173` for local dev) is in the allowed
   **Redirect URLs** list — otherwise Google will redirect back but Supabase
   will refuse to complete the session.

No code changes needed on this end — `signInWithGoogle` in
[`src/store/authStore.ts`](src/store/authStore.ts) already calls
`supabase.auth.signInWithOAuth({ provider: 'google' })`.

## Deploying to Vercel

1. Push this repo to GitHub (already wired to `origin`).
2. In Vercel, "Import Project" from that GitHub repo. Framework preset:
   **Vite**.
3. Add the two env vars from `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   in the Vercel project's Environment Variables settings.
4. Deploy. Then add the resulting `https://your-app.vercel.app` URL to
   Supabase's **Authentication → URL Configuration → Redirect URLs** (see
   above) so Google login works in production too.

## Scripts

```bash
npm run dev       # local dev server
npm run build     # type-check + production build
npm run preview   # preview the production build locally
```
