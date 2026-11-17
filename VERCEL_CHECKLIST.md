# outLIAR — Vercel checklist

Set these for Production (and Preview if you intend to test preview deployments):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — secret; server-side only
- `TOKEN_SECRET` — unique random value, 32+ characters (the app refuses to run in production without it)
- `NEXT_PUBLIC_SITE_URL` — your deployed HTTPS origin (e.g. `https://outliar.vercel.app`)

After changing environment variables, redeploy the project.

**Database:** fresh Supabase project → run `supabase/schema.sql`.
Existing UNDERCOVER database → run `supabase/migration-v2.sql` (adds the new room settings; keeps your data).

Produced by @garethltm.
