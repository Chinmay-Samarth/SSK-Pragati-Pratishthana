# SSK Pragati Pratishthana — Staff Matrimony Desk

Private staff app for matrimonial records (tablet + laptop). Built with Next.js and Supabase.

## Deploy on Vercel

1. Push this repo to GitHub (do **not** commit `.env.local`).
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add these **Environment Variables** (Production + Preview):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API → `anon` / publishable key |
| `STAFF_EMAIL` | Auth email for username `staff` (e.g. `staff@matrimony.app`) |
| `DAS_EMAIL` | Auth email for username `das` |

5. Deploy. After the first deploy, open the Vercel URL and sign in.

### Supabase Auth checklist (required before go-live)

In the Supabase dashboard for project `matrimony`:

1. **Authentication → Providers → Email**
   - Disable **Sign ups** / enable “Confirm email” only if you still need invites manually
   - Prefer: turn **off** public sign-ups so only existing staff users can log in
2. **Authentication → Users**
   - Change the default passwords for `staff` and `das` **before** sharing the production URL
3. **Authentication → URL Configuration**
   - Site URL: your Vercel URL (`https://your-app.vercel.app`)
   - Redirect URLs: add `https://your-app.vercel.app/**` and `http://localhost:3000/**`
4. Confirm `staff_users` still contains both staff Auth user IDs (RLS allowlist)
5. **Authentication → Attack Protection** (or Password settings): enable **Leaked password protection** if available on your plan

Storage buckets `photos` and `charts` are private; staff policies already restrict access.

## Local development

```bash
cp .env.example .env.local
# fill in Supabase URL + publishable key + staff emails
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build check
npm run start   # run the production build locally
```

## Login

Use the usernames configured in Supabase Auth (mapped via `STAFF_EMAIL` / `DAS_EMAIL`).

**Change default passwords in Supabase Auth before production.** Do not leave demo passwords on a public URL.

## Features

- Home folders by **Gender + birth year**
- Add person: **Detailed** (fields + photo + chart) or **Sheet image**
- Fullscreen gallery view, print biodata, Excel export (Boys / Girls sheets)
- Images compressed to WebP on upload

## Stack

- Next.js App Router + TypeScript + Tailwind
- Supabase Auth, Postgres (RLS), Storage
- Excel export via SheetJS (`xlsx`)
- Image processing via `sharp` (supported on Vercel)

## Security notes

- Auth proxy requires a signed-in **allowlisted** staff email
- API routes (`/api/media`, `/api/export`) re-check the staff allowlist
- People + storage access enforced by Supabase RLS (`is_staff()`)
- `robots.txt` disallows indexing
- Security headers set in `next.config.ts`

## Upload limits

Vercel request bodies are limited (~4.5 MB). Prefer phone photos that are not huge raw files; the app compresses images server-side after upload. JPEG/PNG/WebP only.
