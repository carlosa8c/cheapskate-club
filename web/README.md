# Cheapskate Club web app

Next.js + TypeScript foundation. Existing design prototypes remain in the parent directory.

```sh
npm ci
npm run dev -- --port 5188
npm run lint
npm run build
```

Open http://localhost:5188. No credentials are required to preview the pages.
The leaderboard shows an honest setup state, never fabricated participants.
X-first sign-in, GitHub sign-in and private profile settings are implemented.
See AUTH_SETUP.md to enable them. Pairing, signed ingestion and posting remain pending.

## Connect Supabase (when ready)

1. Create a personal Supabase project. Review/apply the SQL migration under
   `supabase/migrations/` using its SQL editor. This foundation exposes only a
   public aggregate RPC; the second migration enables members to read/write only
   their own profiles through RLS. Usage-event writes remain revoked.
2. Copy `.env.example` to `.env.local` and set the project URL and publishable key.
   Never commit credentials or use a service-role key for this read-only client.
3. Restart the development server. An empty connected database shows an empty
   leaderboard; unavailable backend requests show a recoverable service message.

The schema is a foundation, not an implemented signing/ingestion contract. Do not
open public participation until pairing, signature validation, reconciliation,
consent and revocation have their transactional implementation and tests.
Migration execution/RLS integration needs validation against a disposable
Supabase project before production deployment.

## Vercel

Import the private GitHub repository when available and choose `web` as Root
Directory. Use the Next.js preset, and configure the two Supabase variables in
Vercel separately. Start on Hobby only for eligible noncommercial personal use;
Supabase Free may pause for inactivity. No services have been provisioned by
this scaffold. Personal email owns the accounts; paid upgrades need an explicit
choice based on actual usage.
