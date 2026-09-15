# Activate installation pairing and usage sync

This feature needs the matching cheapoS `codex/club-connect` implementation.
No provider inference or paid hosting plan is needed for qualification.

1. Apply **only** `supabase/migrations/202609150003_installations.sql` in Supabase
   SQL Editor. The first two migrations must already be present.
2. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel's server environment. Get the legacy
   service-role key from your Supabase project's API keys. This privileged key
   stays in Vercel only; never send it to cheapoS, paste it in chat, or prefix it
   with NEXT_PUBLIC_. The existing publishable key remains for normal user access.
3. Deploy this branch. SITE_URL and the existing OAuth callbacks remain unchanged.
4. Install the optional dependency in the Python environment running cheapoS:
   `python3 -m pip install -r requirements-club.txt`, then use the matching app
   branch. Do not restart an app doing active work just to enable the Club.
5. In cheapoS Usage & savings, Connect to Club; follow the approval link. It shows
   the exact signed-in @handle. Approve, return, Check connection, then explicitly
   Enable sharing. Only requests begun after enabling count.
6. Finish a small task, click Sync now, and check the appropriate local/public-free
   leaderboard. Unknown, included and paid usage are not public-free entries.

The app's default endpoint is https://cheapskate-club.vercel.app. For isolated
local qualification, CHEAPOS_CLUB_URL can use loopback HTTP. Other hosts require
HTTPS. Keep an installation bound to its configured endpoint.

## Account switches and recovery

One installation has one active account. Disconnect revokes that epoch; reconnect
creates a new approval session. The server retains the signing public key, cursor,
receipts and original event owners. Old usage cannot transfer to the new account.
A service-side disconnect is also available under My club → Your installations.
If the app was offline, retry Disconnect there before starting another pairing.
The app never marks an offline attempt as synced; exact retries return one receipt.

Public profile visibility remains separately editable in My club. Enabling sharing
in the app explicitly enables that profile's leaderboard visibility. Pausing only
stops future uploads; it does not erase previously published totals.

## Validation and remaining live checks

Lint and production build pass. Twelve Node tests (0.14s) include Python-generated
Ed25519 signatures, modified payload rejection and profile behavior. A temporary
PGlite database applied all migrations and exercised approval, consent, duplicate
and conflicting receipts, disconnect retry, account switching and original-owner
preservation (0.69s initial run). This tool was not added to routine dependencies.
Focused cheapoS tests cover outbox retries, missing acknowledgments, corrected
counts, paused uploads and existing usage exclusion. No live model calls used.

Still perform the signed-in browser flow after configuration, including two
accounts and disconnect/reconnect. Hosted Supabase RLS and OAuth are not implied
by a local build or the synthetic SQL run. Public registration policies and account
deletion remain follow-up work. Signatures establish possession of the installation
key, not proof that a modified client reported genuine inference.

Protocol: signed exact UTF-8 payload bytes with `cheapskate-club-v1\n` domain prefix;
SHA-256 payload receipts; monotonic batch sequence and previous hash. The client
outbox retains identical bytes until acknowledged. Settled request corrections
replace original counts rather than append duplicates. Pairing expires after ten
minutes; creation is limited to 30 attempts per hour per hashed network source.

A disposable loopback end-to-end run also passed: actual Python signing → HTTP →
Node signature verification → SQL pairing/consent/sync → leaderboard. A synthetic
15-token request produced 15 tokens, an identical retry remained 15, and disconnect
was acknowledged. Browser OAuth approval was simulated in that isolated fixture.
