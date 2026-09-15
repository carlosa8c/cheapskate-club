# Enable Club membership

1. Apply `supabase/migrations/202609150002_membership.sql` in Supabase SQL Editor
   after the existing foundation migration. Do not rerun the first migration.
2. Add `SITE_URL=https://cheapskate-club.vercel.app` in Vercel. Keep the existing
   `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. No service-role key is needed.
3. Supabase Authentication → URL Configuration: set Site URL to that origin,
   and allow `https://cheapskate-club.vercel.app/auth/callback` as a redirect URL.
4. Configure the providers below, then deploy the membership branch.

## X first

Use **X / Twitter (OAuth 2.0)** in Supabase, not the legacy Twitter provider.
Create a Web App in the X developer dashboard; copy the callback URL shown by
Supabase (`https://<project-ref>.supabase.co/auth/v1/callback`) into X. Enter the
OAuth 2.0 Client ID and Client Secret in Supabase and enable the provider.
Follow the current provider requirements for email permission and policy URLs.
Publish reviewed privacy/terms pages before opening public registration; those
policies are not supplied by this implementation. Do not purchase an X plan
without first checking the account's current access requirements.

## GitHub alternative

Create a GitHub OAuth App with the Club homepage and the same Supabase callback
URL. Enter its Client ID and Client Secret in Supabase's GitHub provider and
enable it. Provider secrets belong in Supabase only, never in Git or chat.
No repository access scope is requested by the Club.

Official setup: https://supabase.com/docs/guides/auth/social-login/auth-twitter
and https://supabase.com/docs/guides/auth/social-login/auth-github

## Verify before opening registration

- Sign in with X: return to `/account`, save a handle and name, then reload.
- Sharing must start unchecked; turn it on/off and confirm it persists.
- Sign out and repeat with GitHub. Use the same provider on returning visits;
  explicit identity linking is not part of this build. Do not promise different
  provider identities will automatically belong to the same Club account.
- In a second account, an existing handle (including alternate capitalization)
  must be rejected. The profile must never show the first account's settings.
- Cancel provider consent: `/join` offers a retry, not a blank page.
- Signed-out `/account` redirects to `/join`.
- Verify RLS with separate authenticated users before public launch: neither
  can read/edit the other's profile or insert usage events. Anonymous direct
  profile access must remain denied. SQL and live OAuth require the configured
  Supabase project; lint/build alone do not validate them.

Signing in does not connect cheapoS or upload usage. Profiles are private except
for opted-in names accompanying accepted leaderboard totals. Installation
pairing, ingestion and public community posting are separate follow-up work.

## Automatic profile defaults

The account page creates a missing profile from OAuth username/name metadata.
No extra Save step is required. Existing profiles are never overwritten. Handles
are normalized to Club rules; collisions get an account-specific suffix. Missing
provider names use a generic member name, never an email address. Sharing remains
off. Edit profile & sharing opens optional settings. No new migration is needed.

Verify with a new X/GitHub account and an already-signed-in account without a
profile: visiting My club should show a ready profile. Edit the name, sign out
and back in, and confirm the edit persists. Provider defaults do not claim
verified ownership of a matching Club handle.
