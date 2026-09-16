# Cheapskate Club — implementation design

Status: agreed product direction, September 15, 2026. This is a fun companion
to cheapoS, not a financial audit or an adversarial competition with prizes.

## Relationship to the prototypes and earlier drafts

Keep the Cheapskate Club visual direction from DESIGN.md. This document is the
implementation authority for trust labels, pairing and sync. Where DESIGN.md,
PROTOCOL.md or cheapskate-club-protocol.md conflict, follow this document.
The existing HTML/JS pages remain fictional prototypes until connected to the
real service. Earlier drafts are references, not ready-to-implement contracts.

In particular, do not implement long-lived secrets in callback URLs, plaintext
client signing-secret files, or badges claiming signatures establish genuine
inference. Historical imports are self-reported, including any debut badges.

## Product and community

Start with profiles, all-time and monthly leaderboards, and account/installation
controls. Separate public-free remote tokens, included-access remote tokens,
paid remote tokens, local tokens, and unknown/estimated accounting. Do not equate
subscription-included access with public-free access. Use reported settled token
counts for competitive totals; show estimates separately. Avoid labelling
hypothetical commercial-price comparisons as actual money saved.

Use App-synced for authenticated, accepted installation events. Explain that it
is client-reported accounting, not independent verification. Imported history
is Imported · self-reported and stays out of the post-join competition.
Provider-verified is reserved for a future independent evidence source; it is
not a launch badge. Local usage remains app-reported.

The Community section will add:
- Showcase posts: what members built, with optional repository links and a
  manually approved run summary.
- Help and discussions: questions, troubleshooting and feature suggestions.
- Recipes: reusable task prompts and model setups with last-tested dates.
- Contributions on profiles alongside usage, so token consumption is not the
  only activity rewarded.

Start with asynchronous posts/comments and simple moderation/reporting. Defer
chat, direct messages, automatic posting and agent-to-agent execution. Imported
recipes are untrusted content; choosing one must not silently execute it.

## Recommended stack and hosting boundary

Use Next.js with TypeScript for public pages and versioned API route handlers,
Supabase Postgres and Auth for relational data and accounts, and CSS Modules
with shared design tokens to retain the prototype's appearance. Keep public
reads separate from privileged ingestion and moderation writes. Installation
credentials authenticate through the service, never direct privileged database
access. Use row-level access policies for member-owned community records.

Support GitHub and X through the account layer, subject to provider setup.
X-only was an earlier design choice; keep identity-provider IDs separate from
public handles so adding a provider does not change event ownership.

The selected starting stack is Next.js on Vercel Hobby and Supabase Free,
using the operator's personal accounts. The Cheapskate Club is the selected
visual and community direction. Deployment and account configuration remain
pending; no paid services have been provisioned. Keep upgrades an explicit
choice based on usage. Supabase Free can pause during inactivity, so display
an honest unavailable state and keep local cheapoS work independent of it.

The private source repository is `carlosa8c/cheapskate-club`. Never commit
service credentials, even to the private repository. Confirm plan eligibility
before deployment and keep spending controls enabled where available.

Use small unit tests for ingestion/accounting and a few browser flows for
joining, revoking, syncing and posting. No inference is required to test these.
Measure new test costs and run change-scoped checks while iterating.

## Pragmatic anti-cheating

Goal: changing a local JSON total in an editor must not change leaderboard
scores. A modified client can still fabricate events and sign them with its
own credential. Do not claim that client signatures prove which executable
ran or whether inference actually happened.

Each installation generates an Ed25519 key pair. Store its private key in OS
credential storage; register the public key through browser-authorized pairing.
No shared secret belongs in the public cheapoS repository. Server credentials
and any future server receipt-signing key belong in deployment secret storage,
not Git, even when the leaderboard repository is private.

The service derives totals from accepted signed events, not uploaded cumulative
numbers. Retain accepted sequence/hash history, enforce idempotency, validate
categories and quarantine suspicious changes for review. A warning is not an
automatic finding of cheating. Rate-limit pairing and ingestion. Signed server
receipts may later make accepted history portable, but still do not prove that
client-reported inference was genuine.

Defer Merkle audits and server challenges beyond ordinary pairing challenges.
They add complexity without solving fabricated client data. Stronger remote
verification would need provider-issued evidence or an optional service-owned
gateway. Neither is required for this fun first release.

## Pairing and consent

1. cheapoS creates an installation key pair and requests a short-lived pairing
   session bound to its public key and a random local challenge.
2. Open the service's pairing page. The member signs in and explicitly confirms
   the installation. An installation UUID alone is never sufficient authority
   to replace an existing key or reassign ownership.
3. The local app completes pairing using its retained challenge and proof of
   private-key possession. Prefer polling the pairing session; a browser return
   link may carry only an expiring single-use code, never a long-lived secret.
4. Show the sharing preview. Account pairing alone does not enable upload.
   Public participation requires an affirmative, initially unchecked choice.
5. Record the post-join accounting boundary and enable background sync.

Support revocation per installation and leaving the leaderboard. Specify and
show the retention/deletion policy before public launch; unlinking a machine
and removing a public profile must have distinct, understandable effects.

## Event contract and server ingestion

Freeze a versioned contract before implementing the client and service. Initial
fields: schema version, installation/key epoch, event ID, sequence number,
previous-event hash, accounting date, category, input/output token counts,
reported/estimated provenance, and record type. Include model identifiers only
if part of the explicit public-data preview. Never upload prompts, code, project
paths/names, chat text, provider keys, or full technical logs.

Use an established RFC 8785 implementation with Python/TypeScript golden vectors
for canonical serialization; sorted JSON alone is not the complete standard.
Define Ed25519 encoding and signature domain separation in those same vectors.
Bound numeric fields to an interoperable integer range and reject malformed or
unknown-version events. Keep amounts in defined integer units if costs are used.

A database transaction must atomically verify installation authorization,
signatures, expected sequence/hash and event IDs; insert accepted events; and
advance the installation cursor. Unique constraints protect against concurrent
retries. Identical retries return the original acknowledgment. Reused IDs or
sequences with different contents return a conflict without changing totals.
The initial chain has an explicit genesis value, and reconnecting must never
silently reset an existing installation's history.

Accept delayed offline events with original accounting dates and server receipt
times; a short timestamp window must not discard legitimate offline usage.
Support explicit reconciliation records referencing earlier events, since usage
may settle after a request. Do not append a second full token count when a
reservation is replaced by final usage. Uncertain/estimated events remain outside
competitive totals. Reject unexplained historical rewrites.

Imported history is a separate self-reported snapshot, not newly signed work.
Multiple installations aggregate independently; copied profiles must not count
the same event history twice. Reinstallation and key loss require an explicit
new epoch/pairing flow with preserved server history and visible import labels.

Suggested tables: profiles, installations, pairing_sessions, usage_events,
sync_batches, moderation_flags; later posts, comments and reports. Use SQL views
or cached aggregates derived from accepted events for rankings.

## Build order

1. Confirm hosting, account providers and data labels. Freeze v1 event/pairing
   contracts and cross-language signature fixtures.
2. Implement accounts, pairing, revocation and transactional ingestion using
   synthetic fixtures. Add public leaderboard/profile queries.
3. Implement the cheapoS integration in CHEAPOS_INTEGRATION.md and exercise two
   installations, offline retry, duplicate delivery, key revocation and import.
4. Connect the Club prototype to real data and run a private alpha. Verify consent,
   profile removal, narrow layouts and truthful sync/error states.
5. Add showcase and help/discussion pages with reporting/moderation, then recipes.

No hosting resources, authentication integrations or production sync are created
by this design update.

## September 15 update: fun-first member profiles

The main scoreboard now adds public-free, included-access, and local tokens into
one zero-cost total. Earlier separate-board requirements are superseded. Paid
and unknown categories remain outside this score. Existing accepted events count
immediately; no re-upload or opt-in to model names is needed for a combined score.

Public `/@handle` profiles show the combined score and category cards. The account
page shows the same stats even when the profile is private. Model breakdowns are
optional: installations must explicitly opt in before sending names, and members
can hide the breakdown from their profile settings. Names are omitted by default;
turning off installation model sharing clears its uploaded names for the current
account. Token totals remain unchanged. No prompts, paths, code, or credentials
are uploaded. Existing signed sequence and idempotent event handling remain.

Run `web/supabase/migrations/202609150004_member_profiles.sql` before deploying
this version. Migration 004 is backward compatible with existing installation
clients. New cheapoS clients use the same category resolver as local usage stats.
Accounting caveats live on About, not in repetitive notices on the scoreboard.
